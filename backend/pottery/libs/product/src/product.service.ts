import {
  ProductEntity,
  ProductRepository,
  ProductImageRepository,
  InventoryRepository,
  InventoryDetailRepository,
  ProductPromotionRepository,
  PromotionRepository,
  PromotionEntity,
  CategoryRepository,
  ProductClassificationRepository,
  ProductAttributeRepository,
  ClassificationAttributeRelationshipRepository,
} from '@app/database';
import { InventoryEntity } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateProduct, IListProduct, IUpdateProduct } from './product.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class ProductService {
  findById(id: number) {
    throw new Error('Method not implemented.');
  }

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productImageRepository: ProductImageRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly inventoryDetailRepository: InventoryDetailRepository,
    private readonly productPromotionRepository: ProductPromotionRepository,
    private readonly promotionRepository: PromotionRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly productClassificationRepository: ProductClassificationRepository,
    private readonly productAttributeRepository: ProductAttributeRepository,
    private readonly classificationAttributeRelationshipRepository: ClassificationAttributeRelationshipRepository,
  ) { }


  async create(data: ICreateProduct) {
    try {
      console.log('Creating product with data:', {
        name: data.name,
        imagesCount: data.images?.length || 0,
        classificationsCount: data.classifications?.length || 0,
      });

      const product = await this.productRepository.create({
        name: data.name,
        description: data.description,
        price: data.price,
        quantity: 0,
        category_id: data.category_id,
        supplier_id: data.supplier_id,
        total_quantity_divided: 0,
      });

      console.log('Product created with ID:', product.id);

      if (data.images && data.images.length > 0) {
        console.log('Creating', data.images.length, 'product images');

        const productImages = data.images.map((image, index) => ({
          product_id: product.id,
          image_data: image.image_data,
          is_main_image: index === 0,
          priority: index + 1,
        }));

        await this.productImageRepository.createMany(productImages);
        console.log('Product images created successfully');
      }

      // Handle classifications and attributes
      if (data.classifications && data.classifications.length > 0) {
        console.log('Creating', data.classifications.length, 'product classifications');

        const attributeIdMap: { [classIndex: number]: { [attrIndex: number]: number } } = {};

        for (let classIndex = 0; classIndex < data.classifications.length; classIndex++) {
          const classificationData = data.classifications[classIndex];

          // Create classification
          const classification = await this.productClassificationRepository.create({
            product_id: product.id,
            name: classificationData.name,
          });

          // Create attributes for this classification
          if (classificationData.attributes && classificationData.attributes.length > 0) {
            attributeIdMap[classIndex] = {};

            for (let attrIndex = 0; attrIndex < classificationData.attributes.length; attrIndex++) {
              const attr = classificationData.attributes[attrIndex];
              const createdAttribute = await this.productAttributeRepository.create({
                product_classification_id: classification.id,
                name: attr.name,
              });

              attributeIdMap[classIndex][attrIndex] = createdAttribute.id;
            }
          }
        }

        console.log('Product classifications created successfully');

        // Handle classification attribute relationships (pricing matrix)
        if (data.relationships && data.relationships.length > 0) {
          console.log('Creating', data.relationships.length, 'attribute relationships');
          console.log('AttributeIdMap:', attributeIdMap);

          const processedRelationships = data.relationships.map((rel) => {
            let actualAttr1Id = rel.product_attribute_id_1;
            let actualAttr2Id = rel.product_attribute_id_2;

            console.log('Original relationship:', rel);
            console.log('Before mapping - attr1Id:', actualAttr1Id, 'attr2Id:', actualAttr2Id);

            // Nếu là số nhỏ (index), map với ID thực tế
            if (actualAttr1Id < 100 && attributeIdMap[0]) {
              const mappedId = attributeIdMap[0][actualAttr1Id];
              console.log('Mapping attr1 index', actualAttr1Id, 'to ID', mappedId);
              actualAttr1Id = mappedId || actualAttr1Id;
            }

            if (actualAttr2Id < 100 && attributeIdMap[1]) {
              const mappedId = attributeIdMap[1][actualAttr2Id];
              console.log('Mapping attr2 index', actualAttr2Id, 'to ID', mappedId);
              actualAttr2Id = mappedId || actualAttr2Id;
            }

            console.log('After mapping - attr1Id:', actualAttr1Id, 'attr2Id:', actualAttr2Id);

            return {
              ...rel,
              product_attribute_id_1: actualAttr1Id,
              product_attribute_id_2: actualAttr2Id,
            };
          });

          console.log('Final processed relationships:', processedRelationships);
          await this.classificationAttributeRelationshipRepository.createMany(
            processedRelationships,
          );

          console.log('Attribute relationships created successfully');
        }
      }

      return product;
    } catch (error) {
      console.error('Error in ProductService.create:', error);
      throw error;
    }
  }

  async findAll(params: IListProduct) {
    const products = await this.productRepository.findAll({
      ...params,
      size: params.size || DEFAULT_PAGE_SIZE,
      page: params.page || DEFAULT_PAGE,
    });

    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        const images = await this.productImageRepository.findByProductId(product.id);
        const processedImages = images.map((image) => ({
          id: image.id,
          image_data: image.image_data ? image.image_data.toString('base64') : null,
          is_main_image: image.is_main_image,
          priority: image.priority,
        }));
        let categoryName: string | null = null;
        if (product.category_id) {
          const category = await this.categoryRepository.findById(product.category_id);
          categoryName = category ? category.name : null;
        }

        // Lấy danh sách phân loại (classifications) giống chi tiết sản phẩm
        const classifications = await this.productClassificationRepository.findByProductId(product.id);
        const processedClassifications = await Promise.all(
          classifications.map(async (classification) => {
            const attributes = await this.productAttributeRepository.findByClassificationId(classification.id);
            return {
              id: classification.id,
              name: classification.name,
              attributes: attributes.map((attr) => ({
                id: attr.id,
                name: attr.name,
              })),
            };
          })
        );

        // Lấy relationships (combo: giá, số lượng, thuộc tính)
        const relationships = await this.classificationAttributeRelationshipRepository.findByProductId(product.id);
        const processedRelationships = await Promise.all(
          relationships.map(async (rel) => {
            // Lấy tên thuộc tính cho mỗi combo
            let attribute1_name: string | null = null;
            let attribute2_name: string | null = null;
            if (rel.product_attribute_id_1) {
              const attr1 = await this.productAttributeRepository.findById(rel.product_attribute_id_1);
              attribute1_name = attr1 ? attr1.name : null;
            }
            if (rel.product_attribute_id_2) {
              const attr2 = await this.productAttributeRepository.findById(rel.product_attribute_id_2);
              attribute2_name = attr2 ? attr2.name : null;
            }
            return {
              id: rel.id,
              product_attribute_id_1: rel.product_attribute_id_1,
              product_attribute_id_2: rel.product_attribute_id_2,
              price: rel.price,
              quantity: rel.quantity,
              attribute1_name,
              attribute2_name,
            };
          })
        );

        return {
          ...product,
          images: processedImages,
          main_image: processedImages.find((img) => img.is_main_image) || null,
          category_name: categoryName,
          classifications: processedClassifications,
          relationships: processedRelationships,
        };
      })
    );

    return productsWithDetails;
  }

  async findOne(id: number) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException('product not found');

    const images = await this.productImageRepository.findByProductId(id);
    const processedImages = images.map((image) => ({
      id: image.id,
      image_data: image.image_data ? image.image_data.toString('base64') : null,
      is_main_image: image.is_main_image,
      priority: image.priority,
    }));

    // Load classifications
    const classifications = await this.productClassificationRepository.findByProductId(id);
    const processedClassifications = await Promise.all(
      classifications.map(async (classification) => {
        const attributes = await this.productAttributeRepository.findByClassificationId(classification.id);
        return {
          id: classification.id,
          name: classification.name,
          attributes: attributes.map((attr) => ({
            id: attr.id,
            name: attr.name,
          })),
        };
      })
    );

    // Load relationships
    const relationships = await this.classificationAttributeRelationshipRepository.findByProductId(id);

    let categoryName: string | null = null;
    if (product.category_id) {
      const category = await this.categoryRepository.findById(product.category_id);
      categoryName = category ? category.name : null;
    }
    return {
      ...product,
      images: processedImages,
      main_image: processedImages.find((img) => img.is_main_image) || null,
      category_name: categoryName,
      classifications: processedClassifications,
      relationships: relationships.map((rel) => ({
        id: rel.id,
        product_attribute_id_1: rel.product_attribute_id_1,
        product_attribute_id_2: rel.product_attribute_id_2,
        price: rel.price,
        quantity: rel.quantity,
      })),
    };
  }

  async update(id: number, data: IUpdateProduct) {
    try {
      console.log('Updating product with ID:', id);
      console.log('Update data:', {
        name: data.name,
        imagesCount: data.images?.length || 0,
        classificationsCount: data.classifications?.length || 0,
      });

      const product = {
        name: data.name,
        description: data.description,
        price: data.price,
        category_id: data.category_id,
        supplier_id: data.supplier_id,
      } as Partial<ProductEntity>;

      await this.productRepository.update(id, product);

      // Handle images update với logic thông minh
      console.log('Processing smart image updates...');

      if (data.imageOperations) {
        // Logic mới: xử lý operations
        console.log('Using new imageOperations logic:', data.imageOperations);
        const { keep, remove, update } = data.imageOperations;

        // Xóa các ảnh được đánh dấu remove
        if (remove && remove.length > 0) {
          console.log('Removing images with IDs:', remove);
          for (const imageId of remove) {
            await this.productImageRepository.softDelete(imageId);
          }
        }

        // Thêm ảnh mới (nếu có)
        if (data.images && data.images.length > 0) {
          // Lấy priority cao nhất hiện tại của ảnh còn lại
          const remainingImages = await this.productImageRepository.findByProductId(id);
          const maxPriority = remainingImages.length > 0 ? Math.max(...remainingImages.map(img => img.priority || 0)) : 0;

          const newImages = data.images.map((image, index) => ({
            product_id: id,
            image_data: image.image_data,
            is_main_image: false, // Sẽ update main image sau
            priority: maxPriority + index + 1,
          }));

          await this.productImageRepository.createMany(newImages);
          console.log('Added', data.images.length, 'new images');
        }

        // Update main image (ảnh đầu tiên còn lại)
        const allRemainingImages = await this.productImageRepository.findByProductId(id);
        if (allRemainingImages.length > 0) {
          // Reset tất cả is_main_image
          for (const img of allRemainingImages) {
            if (img.is_main_image) {
              await this.productImageRepository.update(img.id, { is_main_image: false });
            }
          }
          // Set ảnh đầu tiên làm main (theo priority)
          const sortedImages = allRemainingImages.sort((a, b) => (a.priority || 0) - (b.priority || 0));
          if (sortedImages.length > 0) {
            await this.productImageRepository.update(sortedImages[0].id, { is_main_image: true });
          }
        }

      } else if (data.keepImageIndices !== undefined) {
        // Logic cũ: keepImageIndices (để tương thích)
        console.log('Using legacy keepImageIndices logic:', data.keepImageIndices);

        // Lấy tất cả ảnh hiện có của sản phẩm
        const existingImages = await this.productImageRepository.findByProductId(id);
        console.log('Found', existingImages.length, 'existing images');

        // Xóa những ảnh không có trong keepImageIndices
        const imagesToDelete = existingImages.filter((_, index) =>
          !data.keepImageIndices!.includes(index)
        );

        for (const imageToDelete of imagesToDelete) {
          await this.productImageRepository.softDelete(imageToDelete.id);
          console.log('Deleted image with ID:', imageToDelete.id);
        }

        // Cập nhật priority cho những ảnh còn lại
        const remainingImages = existingImages.filter((_, index) =>
          data.keepImageIndices!.includes(index)
        );

        // Sắp xếp lại priority theo thứ tự trong keepImageIndices
        for (let i = 0; i < data.keepImageIndices.length; i++) {
          const originalIndex = data.keepImageIndices[i];
          const imageToUpdate = existingImages[originalIndex];
          if (imageToUpdate) {
            await this.productImageRepository.update(imageToUpdate.id, {
              priority: i + 1,
              is_main_image: i === 0
            });
            console.log(`Updated image ${imageToUpdate.id}: priority=${i + 1}, is_main=${i === 0}`);
          }
        }

        // Thêm ảnh mới với priority bắt đầu từ số ảnh còn lại + 1
        if (data.images && data.images.length > 0) {
          const startPriority = data.keepImageIndices.length + 1;
          const newImages = data.images.map((image, index) => ({
            product_id: id,
            image_data: image.image_data,
            is_main_image: (data.keepImageIndices?.length || 0) === 0 && index === 0,
            priority: startPriority + index,
          }));

          await this.productImageRepository.createMany(newImages);
          console.log('Added', data.images.length, 'new images starting from priority', startPriority);
        }
      }
      // Nếu chỉ có ảnh mới (không có keepImageIndices), thay thế toàn bộ
      else if (data.images && data.images.length > 0) {
        console.log('Full image replacement');
        await this.productImageRepository.deleteByProductId(id);

        const newImages = data.images.map((image, index) => ({
          product_id: id,
          image_data: image.image_data,
          is_main_image: index === 0,
          priority: index + 1,
        }));

        await this.productImageRepository.createMany(newImages);
        console.log('Replaced all images with', data.images.length, 'new images');
      }
      // Nếu không có gì, giữ nguyên ảnh hiện có
      else {
        console.log('No image changes, keeping existing images');
      }

      // Handle classifications update
      if (data.classifications !== undefined) {
        console.log('Updating product classifications intelligently');

        // Lấy classifications hiện tại
        const existingClassifications = await this.productClassificationRepository.findByProductId(id);
        const existingRelationships = await this.classificationAttributeRelationshipRepository.findByProductId(id);

        if (data.classifications && data.classifications.length > 0) {
          console.log('Processing classification updates');

          const attributeIdMap: { [classIndex: number]: { [attrIndex: number]: number } } = {};

          for (let classIndex = 0; classIndex < data.classifications.length; classIndex++) {
            const classificationData = data.classifications[classIndex];
            let classification;

            // Cập nhật hoặc tạo mới classification
            if (existingClassifications[classIndex]) {
              // UPDATE classification hiện có
              console.log(`Updating existing classification ${classIndex}:`, classificationData.name);
              await this.productClassificationRepository.update(
                existingClassifications[classIndex].id,
                { name: classificationData.name }
              );
              classification = existingClassifications[classIndex];
              classification.name = classificationData.name;
            } else {
              // CREATE classification mới
              console.log(`Creating new classification ${classIndex}:`, classificationData.name);
              classification = await this.productClassificationRepository.create({
                product_id: id,
                name: classificationData.name,
              });
            }

            // Xử lý attributes
            if (classificationData.attributes && classificationData.attributes.length > 0) {
              attributeIdMap[classIndex] = {};

              // Lấy attributes hiện có của classification này
              const existingAttributes = await this.productAttributeRepository.findByClassificationId(classification.id);

              for (let attrIndex = 0; attrIndex < classificationData.attributes.length; attrIndex++) {
                const attr = classificationData.attributes[attrIndex];
                let createdAttribute;

                if (existingAttributes[attrIndex]) {
                  // UPDATE attribute hiện có
                  console.log(`Updating existing attribute ${attrIndex}:`, attr.name);
                  await this.productAttributeRepository.update(
                    existingAttributes[attrIndex].id,
                    { name: attr.name }
                  );
                  createdAttribute = existingAttributes[attrIndex];
                  createdAttribute.name = attr.name;
                } else {
                  // CREATE attribute mới
                  console.log(`Creating new attribute ${attrIndex}:`, attr.name);
                  createdAttribute = await this.productAttributeRepository.create({
                    product_classification_id: classification.id,
                    name: attr.name,
                  });
                }

                attributeIdMap[classIndex][attrIndex] = createdAttribute.id;
              }

              // Xóa các attributes thừa (nếu có)
              if (existingAttributes.length > classificationData.attributes.length) {
                for (let i = classificationData.attributes.length; i < existingAttributes.length; i++) {
                  console.log(`Soft deleting excess attribute ${i}`);
                  await this.productAttributeRepository.deleteByClassificationId(existingAttributes[i].id);
                }
              }
            }
          }

          // Xóa các classifications thừa (nếu có)
          if (existingClassifications.length > data.classifications.length) {
            for (let i = data.classifications.length; i < existingClassifications.length; i++) {
              console.log(`Soft deleting excess classification ${i}`);
              await this.productAttributeRepository.deleteByClassificationId(existingClassifications[i].id);
              await this.productClassificationRepository.softDelete(existingClassifications[i].id);
            }
          }

          console.log('Updated attributeIdMap:', attributeIdMap);

          // Handle relationships update
          if (data.relationships && data.relationships.length > 0) {
            console.log('Updating classification attribute relationships');

            // Map relationships to existing ones or create new
            const relationshipsToUpdate: Array<{
              id: number;
              product_attribute_id_1: number;
              product_attribute_id_2: number;
              price: number;
            }> = [];

            const relationshipsToCreate: Array<{
              product_attribute_id_1: number;
              product_attribute_id_2: number;
              price: number;
            }> = [];

            data.relationships.forEach((rel, index) => {
              let actualAttr1Id = rel.product_attribute_id_1;
              let actualAttr2Id = rel.product_attribute_id_2;

              console.log('Processing relationship update:', rel);

              // Map indices to actual IDs if needed
              if (actualAttr1Id < 100 && attributeIdMap[0]) {
                const mappedId = attributeIdMap[0][actualAttr1Id];
                console.log('Update: Mapping attr1 index', actualAttr1Id, 'to ID', mappedId);
                actualAttr1Id = mappedId || actualAttr1Id;
              }

              if (actualAttr2Id < 100 && attributeIdMap[1]) {
                const mappedId = attributeIdMap[1][actualAttr2Id];
                console.log('Update: Mapping attr2 index', actualAttr2Id, 'to ID', mappedId);
                actualAttr2Id = mappedId || actualAttr2Id;
              }

              const processedRel = {
                product_attribute_id_1: actualAttr1Id,
                product_attribute_id_2: actualAttr2Id,
                price: rel.price || 0,
              };

              // Tìm relationship tương ứng trong existing
              const existingRel = existingRelationships.find(
                r => r.product_attribute_id_1 === actualAttr1Id &&
                  r.product_attribute_id_2 === actualAttr2Id
              );

              if (existingRel) {
                // UPDATE relationship hiện có
                relationshipsToUpdate.push({
                  id: existingRel.id,
                  ...processedRel
                });
              } else {
                // CREATE relationship mới
                relationshipsToCreate.push(processedRel);
              }
            });

            // Thực hiện updates
            for (const relUpdate of relationshipsToUpdate) {
              console.log('Updating existing relationship:', relUpdate.id);
              await this.classificationAttributeRelationshipRepository.update(relUpdate.id, {
                price: relUpdate.price,
              });
            }

            // Thực hiện creates
            if (relationshipsToCreate.length > 0) {
              console.log('Creating new relationships:', relationshipsToCreate.length);
              await this.classificationAttributeRelationshipRepository.createMany(relationshipsToCreate);
            }

            // Xóa relationships không còn sử dụng
            const currentAttrIds = data.relationships.map(rel => [rel.product_attribute_id_1, rel.product_attribute_id_2]);
            const relationshipsToDelete = existingRelationships.filter(rel => {
              return !currentAttrIds.some(([id1, id2]) =>
                (rel.product_attribute_id_1 === id1 && rel.product_attribute_id_2 === id2) ||
                (attributeIdMap[0] && attributeIdMap[0][id1] === rel.product_attribute_id_1 &&
                  attributeIdMap[1] && attributeIdMap[1][id2] === rel.product_attribute_id_2)
              );
            });

            for (const relToDelete of relationshipsToDelete) {
              console.log('Soft deleting unused relationship:', relToDelete.id);
              await this.classificationAttributeRelationshipRepository.update(relToDelete.id, {
                deleted_at: new Date(),
              });
            }

            console.log('Classification relationships updated successfully');
          }
        } else {
          // Nếu không có classifications mới, xóa tất cả
          console.log('No classifications provided, soft deleting all existing');
          await this.classificationAttributeRelationshipRepository.deleteByProductId(id);
          for (const classification of existingClassifications) {
            await this.productAttributeRepository.deleteByClassificationId(classification.id);
            await this.productClassificationRepository.softDelete(classification.id);
          }
        }
      }

      return await this.findOne(id);
    } catch (error) {
      console.error('Error in ProductService.update:', error);
      throw error;
    }
  }

  async softDelete(id: number) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException('product not found');

    await this.productImageRepository.deleteByProductId(id);

    return this.productRepository.softDelete(id);
  }

  async findAllByStore(storeId: number) {
    const inventories = await this.inventoryRepository.findByStore(storeId);
    const productsWithStock = await Promise.all(
      inventories.map(async (inv) => {
        const product = await this.productRepository.findById(inv.product_id);
        if (!product) return null;
        const images = await this.productImageRepository.findByProductId(inv.product_id);
        const processedImages = images.map((image) => ({
          id: image.id,
          image_data: image.image_data ? image.image_data.toString('base64') : null,
          is_main_image: image.is_main_image,
          priority: image.priority,
        }));
        let promotion: PromotionEntity | null = null;
        const productPromotion = await this.productPromotionRepository.findActiveByProductId(inv.product_id);
        if (productPromotion && productPromotion.promotion_id) {
          promotion = await this.promotionRepository.findById(productPromotion.promotion_id);
        }
        let categoryName: string | null = null;
        if (product.category_id) {
          const category = await this.categoryRepository.findById(product.category_id);
          categoryName = category ? category.name : null;
        }
        // Lấy danh sách phân loại (classifications) giống chi tiết sản phẩm
        const classifications = await this.productClassificationRepository.findByProductId(product.id);
        const processedClassifications = await Promise.all(
          classifications.map(async (classification) => {
            const attributes = await this.productAttributeRepository.findByClassificationId(classification.id);
            return {
              id: classification.id,
              name: classification.name,
              attributes: attributes.map((attr) => ({
                id: attr.id,
                name: attr.name,
              })),
            };
          })
        );
        // Lấy relationships (combo: giá, số lượng, thuộc tính) giống chi tiết sản phẩm
        const relationships = await this.classificationAttributeRelationshipRepository.findByProductId(product.id);
        const processedRelationships = relationships.map((rel) => ({
          id: rel.id,
          product_attribute_id_1: rel.product_attribute_id_1,
          product_attribute_id_2: rel.product_attribute_id_2,
          price: rel.price,
          quantity: rel.quantity,
          attribute1_name: rel.attribute1?.name || '',
          attribute2_name: rel.attribute2?.name || '',
        }));
        return {
          ...product,
          images: processedImages,
          main_image: processedImages.find((img) => img.is_main_image) || null,
          store_id: inv.store_id,
          quantity_stock: inv.quantity_stock,
          quantity_sold: inv.quantity_sold,
          store_name: inv.store?.store_name,
          store_address: inv.store?.address,
          promotion,
          category_name: categoryName,
          classifications: processedClassifications,
          relationships: processedRelationships,
        };
      })
    );
    return productsWithStock.filter((item) => item !== null);
  }

  async findAllByInventory() {
    const inventories = await this.inventoryRepository.findAll();
    const inventoryMap = new Map<number, InventoryEntity[]>();
    inventories.forEach((inv: InventoryEntity) => {
      if (!inv.product_id) return;
      if (!inventoryMap.has(inv.product_id)) {
        inventoryMap.set(inv.product_id, []);
      }
      const arr = inventoryMap.get(inv.product_id);
      if (arr) arr.push(inv);
    });

    const products = await Promise.all(
      Array.from(inventoryMap.entries()).map(
        async ([productId, invList]: [number, InventoryEntity[]]) => {
          const product = await this.productRepository.findById(productId);
          if (!product) return null;
          const images = await this.productImageRepository.findByProductId(productId);
          const processedImages = images.map((image) => ({
            id: image.id,
            image_data: image.image_data
              ? image.image_data.toString('base64')
              : null,
            is_main_image: image.is_main_image,
            priority: image.priority,
          }));
          let promotion: PromotionEntity | null = null;
          const productPromotion = await this.productPromotionRepository.findActiveByProductId(productId);
          if (productPromotion && productPromotion.promotion_id) {
            promotion = await this.promotionRepository.findById(productPromotion.promotion_id);
          }
          let categoryName: string | null = null;
          if (product && product.category_id) {
            const category = await this.categoryRepository.findById(product.category_id);
            categoryName = category ? category.name : null;
          }
          // Lấy danh sách phân loại (classifications) giống chi tiết sản phẩm
          const classifications = await this.productClassificationRepository.findByProductId(productId);
          const processedClassifications = await Promise.all(
            classifications.map(async (classification) => {
              const attributes = await this.productAttributeRepository.findByClassificationId(classification.id);
              return {
                id: classification.id,
                name: classification.name,
                attributes: attributes.map((attr) => ({
                  id: attr.id,
                  name: attr.name,
                })),
              };
            })
          );
          // Lấy relationships (combo: giá, số lượng, thuộc tính) giống chi tiết sản phẩm
          const relationships = await this.classificationAttributeRelationshipRepository.findByProductId(productId);
          const processedRelationships = relationships.map((rel) => ({
            id: rel.id,
            product_attribute_id_1: rel.product_attribute_id_1,
            product_attribute_id_2: rel.product_attribute_id_2,
            price: rel.price,
            quantity: rel.quantity,
            attribute1_name: rel.attribute1?.name || '',
            attribute2_name: rel.attribute2?.name || '',
          }));

          // Thêm chi tiết classifications cho từng store giống như findInventoryDetailByProductId
          const stores = await Promise.all(invList.map(async (inv: InventoryEntity) => {
            const inventoryDetails = await this.inventoryDetailRepository.findByInventoryId(inv.id);
            const storeClassifications = await Promise.all(inventoryDetails.map(async detail => {
              const relationship = detail.classification_attribute_relationship;
              let classification1_name = '';
              let classification2_name = '';
              if (relationship?.product_attribute_id_1) {
                for (const cls of processedClassifications) {
                  if (cls.attributes.some(attr => attr.id === relationship.product_attribute_id_1)) {
                    classification1_name = cls.name;
                    break;
                  }
                }
              }
              if (relationship?.product_attribute_id_2) {
                for (const cls of processedClassifications) {
                  if (cls.attributes.some(attr => attr.id === relationship.product_attribute_id_2)) {
                    classification2_name = cls.name;
                    break;
                  }
                }
              }
              let attribute1_name = relationship?.attribute1?.name || '';
              let attribute2_name = relationship?.attribute2?.name || '';
              if (!attribute1_name && relationship?.product_attribute_id_1) {
                const attr1 = await this.productAttributeRepository.findById(relationship.product_attribute_id_1);
                attribute1_name = attr1?.name || '';
              }
              if (!attribute2_name && relationship?.product_attribute_id_2) {
                const attr2 = await this.productAttributeRepository.findById(relationship.product_attribute_id_2);
                attribute2_name = attr2?.name || '';
              }
              return {
                id: relationship?.id,
                attribute1_id: relationship?.product_attribute_id_1,
                attribute2_id: relationship?.product_attribute_id_2,
                attribute1_name,
                attribute2_name,
                classification1_name,
                classification2_name,
                price: relationship?.price || 0,
                quantity_stock: detail.quantity_stock,
                quantity_sold: detail.quantity_sold,
              };
            }));
            return {
              store_id: inv.store_id,
              store_name: inv.store && inv.store.store_name ? inv.store.store_name : null,
              store_address: inv.store && inv.store.address ? inv.store.address : null,
              quantity_stock: inv.quantity_stock,
              quantity_sold: inv.quantity_sold,
              classifications: storeClassifications,
            };
          }));
          const total_quantity_sold = invList.reduce((sum, inv) => sum + (inv.quantity_sold || 0), 0);
          return {
            ...product,
            images: processedImages,
            main_image: processedImages.find((img) => img.is_main_image) || null,
            stores,
            total_quantity_sold,
            promotion,
            category_name: categoryName,
            classifications: processedClassifications,
            relationships: processedRelationships,
          };
        },
      )
    );
    return {
      products: products.filter((item) => item !== null)
    };
  }

  async findAllByInventoryWithCategory(categoryId: number) {
    const inventories = await this.inventoryRepository.findAll();
    const inventoryMap = new Map<number, InventoryEntity[]>();
    inventories.forEach((inv: InventoryEntity) => {
      if (!inv.product_id) return;
      if (!inventoryMap.has(inv.product_id)) {
        inventoryMap.set(inv.product_id, []);
      }
      const arr = inventoryMap.get(inv.product_id);
      if (arr) arr.push(inv);
    });

    const products = await Promise.all(
      Array.from(inventoryMap.entries()).map(async ([productId, invList]: [number, InventoryEntity[]]) => {
        const product = await this.productRepository.findById(productId);
        if (!product || product.category_id !== categoryId) return null;
        const images = await this.productImageRepository.findByProductId(productId);
        const processedImages = images.map((image) => ({
          id: image.id,
          image_data: image.image_data ? image.image_data.toString('base64') : null,
          is_main_image: image.is_main_image,
          priority: image.priority,
        }));
        let promotion: PromotionEntity | null = null;
        const productPromotion = await this.productPromotionRepository.findActiveByProductId(productId);
        if (productPromotion && productPromotion.promotion_id) {
          promotion = await this.promotionRepository.findById(productPromotion.promotion_id);
        }
        let categoryName: string | null = null;
        if (product.category_id) {
          const category = await this.categoryRepository.findById(product.category_id);
          categoryName = category ? category.name : null;
        }
        // Lấy danh sách phân loại (classifications) giống chi tiết sản phẩm
        const classifications = await this.productClassificationRepository.findByProductId(productId);
        const processedClassifications = await Promise.all(
          classifications.map(async (classification) => {
            const attributes = await this.productAttributeRepository.findByClassificationId(classification.id);
            return {
              id: classification.id,
              name: classification.name,
              attributes: attributes.map((attr) => ({
                id: attr.id,
                name: attr.name,
              })),
            };
          })
        );
        // Lấy relationships (combo: giá, số lượng, thuộc tính) giống chi tiết sản phẩm
        const relationships = await this.classificationAttributeRelationshipRepository.findByProductId(productId);
        const processedRelationships = relationships.map((rel) => ({
          id: rel.id,
          product_attribute_id_1: rel.product_attribute_id_1,
          product_attribute_id_2: rel.product_attribute_id_2,
          price: rel.price,
          quantity: rel.quantity,
          attribute1_name: rel.attribute1?.name || '',
          attribute2_name: rel.attribute2?.name || '',
        }));

        // Thêm chi tiết classifications cho từng store giống như findInventoryDetailByProductId
        const stores = await Promise.all(invList.map(async (inv: InventoryEntity) => {
          const inventoryDetails = await this.inventoryDetailRepository.findByInventoryId(inv.id);
          const storeClassifications = await Promise.all(inventoryDetails.map(async detail => {
            const relationship = detail.classification_attribute_relationship;
            let classification1_name = '';
            let classification2_name = '';
            if (relationship?.product_attribute_id_1) {
              for (const cls of processedClassifications) {
                if (cls.attributes.some(attr => attr.id === relationship.product_attribute_id_1)) {
                  classification1_name = cls.name;
                  break;
                }
              }
            }
            if (relationship?.product_attribute_id_2) {
              for (const cls of processedClassifications) {
                if (cls.attributes.some(attr => attr.id === relationship.product_attribute_id_2)) {
                  classification2_name = cls.name;
                  break;
                }
              }
            }
            let attribute1_name = relationship?.attribute1?.name || '';
            let attribute2_name = relationship?.attribute2?.name || '';
            if (!attribute1_name && relationship?.product_attribute_id_1) {
              const attr1 = await this.productAttributeRepository.findById(relationship.product_attribute_id_1);
              attribute1_name = attr1?.name || '';
            }
            if (!attribute2_name && relationship?.product_attribute_id_2) {
              const attr2 = await this.productAttributeRepository.findById(relationship.product_attribute_id_2);
              attribute2_name = attr2?.name || '';
            }
            return {
              id: relationship?.id,
              attribute1_id: relationship?.product_attribute_id_1,
              attribute2_id: relationship?.product_attribute_id_2,
              attribute1_name,
              attribute2_name,
              classification1_name,
              classification2_name,
              price: relationship?.price || 0,
              quantity_stock: detail.quantity_stock,
              quantity_sold: detail.quantity_sold,
            };
          }));
          return {
            store_id: inv.store_id,
            store_name: inv.store && inv.store.store_name ? inv.store.store_name : null,
            store_address: inv.store && inv.store.address ? inv.store.address : null,
            quantity_stock: inv.quantity_stock,
            quantity_sold: inv.quantity_sold,
            classifications: storeClassifications,
          };
        }));
        const total_quantity_sold = invList.reduce((sum, inv) => sum + (inv.quantity_sold || 0), 0);
        return {
          ...product,
          images: processedImages,
          main_image: processedImages.find((img) => img.is_main_image) || null,
          stores,
          total_quantity_sold,
          promotion,
          category_name: categoryName,
          classifications: processedClassifications,
          relationships: processedRelationships,
        };
      }),
    );
    return {
      products: products.filter((item) => item !== null)
    };
  }

  async findInventoryDetailByProductId(productId: number) {
    const inventories = await this.inventoryRepository.findAll();
    const invList = inventories.filter((inv: InventoryEntity) => inv.product_id === productId);
    if (invList.length === 0) {
      throw new NotFoundException('No inventory found for this product');
    }
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundException('product not found');

    const images = await this.productImageRepository.findByProductId(productId);
    const processedImages = images.map((image) => ({
      id: image.id,
      image_data: image.image_data ? image.image_data.toString('base64') : null,
      is_main_image: image.is_main_image,
      priority: image.priority,
    }));

    // Load classifications
    const classifications = await this.productClassificationRepository.findByProductId(productId);
    const processedClassifications = await Promise.all(
      classifications.map(async (classification) => {
        const attributes = await this.productAttributeRepository.findByClassificationId(classification.id);
        return {
          id: classification.id,
          name: classification.name,
          attributes: attributes.map((attr) => ({
            id: attr.id,
            name: attr.name,
          })),
        };
      })
    );

    // Load relationships (combinations)
    const relationships = await this.classificationAttributeRelationshipRepository.findByProductId(productId);

    let promotion: PromotionEntity | null = null;
    const productPromotion = await this.productPromotionRepository.findActiveByProductId(productId);
    if (productPromotion && productPromotion.promotion_id) {
      promotion = await this.promotionRepository.findById(productPromotion.promotion_id);
    }

    let categoryName: string | null = null;
    if (product.category_id) {
      const category = await this.categoryRepository.findById(product.category_id);
      categoryName = category ? category.name : null;
    }

    const stores = await Promise.all(invList.map(async (inv: InventoryEntity) => {
      // Get inventory details for this store (with classifications)
      const inventoryDetails = await this.inventoryDetailRepository.findByInventoryId(inv.id);

      const classifications = await Promise.all(inventoryDetails.map(async detail => {
        const relationship = detail.classification_attribute_relationship;
        // Find classification names for attribute1 and attribute2 using processedClassifications
        let classification1_name = '';
        let classification2_name = '';
        if (relationship?.product_attribute_id_1) {
          for (const cls of processedClassifications) {
            if (cls.attributes.some(attr => attr.id === relationship.product_attribute_id_1)) {
              classification1_name = cls.name;
              break;
            }
          }
        }
        if (relationship?.product_attribute_id_2) {
          for (const cls of processedClassifications) {
            if (cls.attributes.some(attr => attr.id === relationship.product_attribute_id_2)) {
              classification2_name = cls.name;
              break;
            }
          }
        }
        // Ensure attribute names are filled
        let attribute1_name = relationship?.attribute1?.name || '';
        let attribute2_name = relationship?.attribute2?.name || '';
        if (!attribute1_name && relationship?.product_attribute_id_1) {
          const attr1 = await this.productAttributeRepository.findById(relationship.product_attribute_id_1);
          attribute1_name = attr1?.name || '';
        }
        if (!attribute2_name && relationship?.product_attribute_id_2) {
          const attr2 = await this.productAttributeRepository.findById(relationship.product_attribute_id_2);
          attribute2_name = attr2?.name || '';
        }
        return {
          id: relationship?.id,
          attribute1_id: relationship?.product_attribute_id_1,
          attribute2_id: relationship?.product_attribute_id_2,
          attribute1_name,
          attribute2_name,
          classification1_name,
          classification2_name,
          price: relationship?.price || 0,
          quantity_stock: detail.quantity_stock,
          quantity_sold: detail.quantity_sold,
        };
      }));

      return {
        store_id: inv.store_id,
        store_name: inv.store && inv.store.store_name ? inv.store.store_name : null,
        store_address: inv.store && inv.store.address ? inv.store.address : null,
        quantity_stock: inv.quantity_stock, // Total for this store
        quantity_sold: inv.quantity_sold,   // Total for this store
        classifications, // Available combinations for this store
      };
    }));

    const total_quantity_sold = invList.reduce((sum, inv) => sum + (inv.quantity_sold || 0), 0);

    return {
      ...product,
      images: processedImages,
      main_image: processedImages.find((img) => img.is_main_image) || null,
      stores,
      total_quantity_sold,
      promotion,
      category_name: categoryName,
      classifications: processedClassifications,
      relationships: relationships.map((rel) => ({
        id: rel.id,
        product_attribute_id_1: rel.product_attribute_id_1,
        product_attribute_id_2: rel.product_attribute_id_2,
        price: rel.price,
        quantity: rel.quantity,
        attribute1_name: rel.attribute1?.name || '',
        attribute2_name: rel.attribute2?.name || '',
      })),
    };
  }

  async findBySupplier(supplier_id: number) {
    const products = await this.productRepository.findBySupplier(supplier_id);
    if (!products || products.length === 0) return [];

    return await Promise.all(
      products.map(async (product) => {
        const images = await this.productImageRepository.findByProductId(product.id);
        const processedImages = images.map((image) => ({
          id: image.id,
          image_data: image.image_data ? image.image_data.toString('base64') : null,
          is_main_image: image.is_main_image,
          priority: image.priority,
        }));
        let categoryName: string | null = null;
        if (product.category_id) {
          const category = await this.categoryRepository.findById(product.category_id);
          categoryName = category ? category.name : null;
        }
        return {
          ...product,
          images: processedImages,
          main_image: processedImages.find((img) => img.is_main_image) || null,
          category_name: categoryName,
        };
      })
    );
  }

  async getProductClassifications(productId: number) {
    try {
      const relationships = await this.classificationAttributeRelationshipRepository.findByProductIdForImport(productId);
      const classifications = relationships.map(relationship => ({
        id: relationship.id,
        name: `${relationship.attribute1?.name || ''} - ${relationship.attribute2?.name || ''}`,
        price: relationship.price || 0,
        quantity: relationship.quantity || 0,
        product_attribute_id_1: relationship.product_attribute_id_1,
        product_attribute_id_2: relationship.product_attribute_id_2,
        attribute1_name: relationship.attribute1?.name || '',
        attribute2_name: relationship.attribute2?.name || '',
      }));
      return classifications;
    } catch (error) {
      console.error('Error getting product classifications:', error);
      return [];
    }
  }
}
