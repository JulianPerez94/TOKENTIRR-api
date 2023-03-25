import { v4 as uuidv4 } from 'uuid';
import { Service } from '../layers';
import CardRepo from '../repositories/CardRepo';
import { CardCreationRequest, Circle } from '@circle-fin/circle-sdk';
import config from '../config/default';

@Service()
export default class CardService {
  constructor(readonly cardRepo: CardRepo) {}

  async create(card: CardCreationRequest, host: string) {
    card.metadata.ipAddress = '127.0.0.1';
    card.metadata.sessionId = 'DE6FA86F60BB47B379307F851E238617';
    const cardResponse = await this.circleCreateCard(card);

    const cardData = {
      ...cardResponse,
      cardId: cardResponse?.id,
    };
    cardData.id = uuidv4();
    return await this.cardRepo.save(cardData);
  }

  async findById(id: string) {
    return (await this.cardRepo.find({ id }))[0];
  }

  async circleCreateCard(card: CardCreationRequest) {
    try {
      const circle = new Circle(config.circleApiKey, config.circleBaseUrl);
      const result = await circle.cards.createCard(card);

      return result.data.data;
    } catch (error) {
      error.message = `Error creating card on circle: [${error?.response?.data?.code}]-${error?.response?.data?.message}`;
      throw error;
    }
  }
}
