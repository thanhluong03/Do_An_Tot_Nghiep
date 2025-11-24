import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service';

describe('ConversationService', () => {
    let service: ConversationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ConversationService,
                    useValue: {
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ConversationService>(ConversationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
