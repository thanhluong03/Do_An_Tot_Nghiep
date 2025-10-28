import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ImportProductDetailRepository,
  ClassificationAttributeRelationshipRepository,
  ImportProductRepository,
} from '@app/database';
import {
  CreateImportProductDetailInput,
  UpdateImportProductDetailInput,
  ListImportProductDetailInput,
} from './import_product_detail.interface';

@Injectable()
export class ImportProductDetailService {
  constructor(
    private readonly importProductDetailRepository: ImportProductDetailRepository,
    private readonly classificationAttributeRelationshipRepository: ClassificationAttributeRelationshipRepository,
    private readonly importProductRepository: ImportProductRepository,
  ) {}

  async create(data: CreateImportProductDetailInput) {
    const importProductId = Number(data.import_product_id);

    for (const item of data.details) {
      const classificationId = Number(
        item.classification_attribute_relationship_id,
      );
      await this.importProductDetailRepository.create({
        import_product_id: importProductId,
        classification_attribute_relationship_id: classificationId,
        import_quantity: item.import_quantity,
        import_price: item.import_price,
      });

      // Update inventory quantity for the specific classification
      const classification =
        await this.classificationAttributeRelationshipRepository.findById(
          classificationId,
        );
      if (classification) {
        classification.quantity =
          Number(classification.quantity || 0) + item.import_quantity;
        await this.classificationAttributeRelationshipRepository.update(
          classificationId,
          {
            quantity: classification.quantity,
          },
        );
      }
    }

    const { data: allDetails } = await this.list({
      page: 1,
      size: 1000,
      import_product_id: importProductId,
    });

    return {
      importProductDetails: allDetails,
    };
  }

  async update(id: number, data: UpdateImportProductDetailInput) {
    const detail = await this.importProductDetailRepository.findById(id);
    if (!detail) {
      throw new NotFoundException('Import product detail not found');
    }

    const oldQuantity = detail.import_quantity || 0;
    const newQuantity =
      typeof data.import_quantity === 'number'
        ? data.import_quantity
        : oldQuantity;
    const quantityDiff = newQuantity - oldQuantity;

    await this.importProductDetailRepository.update(id, data);

    // Update classification quantity
    if (quantityDiff !== 0) {
      const classification =
        await this.classificationAttributeRelationshipRepository.findById(
          detail.classification_attribute_relationship_id,
        );
      if (classification) {
        classification.quantity =
          Number(classification.quantity || 0) + quantityDiff;
        await this.classificationAttributeRelationshipRepository.update(
          detail.classification_attribute_relationship_id,
          {
            quantity: classification.quantity,
          },
        );
      }
    }

    return { updated: true };
  }

  async delete(id: number) {
    const detail = await this.importProductDetailRepository.findById(id);
    if (!detail) {
      throw new NotFoundException('Import product detail not found');
    }

    // Decrease classification quantity
    const classification =
      await this.classificationAttributeRelationshipRepository.findById(
        detail.classification_attribute_relationship_id,
      );
    if (classification) {
      classification.quantity =
        Number(classification.quantity || 0) - (detail.import_quantity || 0);
      await this.classificationAttributeRelationshipRepository.update(
        detail.classification_attribute_relationship_id,
        {
          quantity: classification.quantity,
        },
      );
    }

    await this.importProductDetailRepository.softDelete(id);
    return { deleted: true };
  }

  async list(
    input: ListImportProductDetailInput,
  ): Promise<{ data: any[]; total: number; page: number; size: number }> {
    let list = await this.importProductDetailRepository.findAll();

    // Filter by import_product_id
    if (
      input.import_product_id !== undefined &&
      input.import_product_id !== null
    ) {
      const importProductId = Number(input.import_product_id);
      list = list.filter(
        (detail) => Number(detail.import_product_id) === importProductId,
      );
    }

    // Filter by classification_attribute_relationship_id
    if (
      input.classification_attribute_relationship_id !== undefined &&
      input.classification_attribute_relationship_id !== null
    ) {
      const classificationId = Number(
        input.classification_attribute_relationship_id,
      );
      list = list.filter(
        (detail) =>
          Number(detail.classification_attribute_relationship_id) ===
          classificationId,
      );
    }

    // Search by key
    if (input.key && input.key.trim() !== '') {
      const keyLower = input.key.toLowerCase();
      list = list.filter((detail) => {
        const attr1Name =
          detail.classification_attribute_relationship?.attribute1?.name?.toLowerCase() ||
          '';
        const attr2Name =
          detail.classification_attribute_relationship?.attribute2?.name?.toLowerCase() ||
          '';
        return attr1Name.includes(keyLower) || attr2Name.includes(keyLower);
      });
    }

    const total = list.length;
    const page = input.page && input.page > 0 ? input.page : 1;
    const size = input.size && input.size > 0 ? input.size : 10;
    const start = (page - 1) * size;
    const end = start + size;

    const data = list.slice(start, end).map((detail) => ({
      id: detail.id,
      import_product_id: detail.import_product_id,
      classification_attribute_relationship_id:
        detail.classification_attribute_relationship_id,
      classification_name: `${detail.classification_attribute_relationship?.attribute1?.name || ''} - ${detail.classification_attribute_relationship?.attribute2?.name || ''}`,
      import_quantity: detail.import_quantity,
      import_price: detail.import_price,
      created_at: detail.created_at,
      updated_at: detail.updated_at,
    }));

    return { data, total, page, size };
  }
}
