import { Action } from '../layers';
import CardService from '../services/CardService';
import { CardCreationRequest } from '@circle-fin/circle-sdk';

@Action()
export default class CreateCardAction {
  constructor(readonly cardService: CardService) {}

  async do(card: CardCreationRequest, host: string) {
    return await this.cardService.create(card, host);
  }
}
