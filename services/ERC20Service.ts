import { FindOptionsWhere } from 'typeorm';
import EthersWrapper from '../domain/blockchain/EthersWrapper';
import ERC20Deploy from '../domain/entities/ERC20Deploy';
import CustomLogger from '../infrastructure/CustomLogger';
import { Service } from '../layers';
import ERC20Entity from '../model/ERC20Entity';
import PropertyEntity from '../model/PropertyEntity';
import UserEntity from '../model/UserEntity';
import ERC20Repo from '../repositories/ERC20Repo';
import PropertyRepo from '../repositories/PropertyRepo';

@Service()
export default class ERC20Service {
  constructor(
    readonly erc20Repo: ERC20Repo,
    readonly propertyRepo: PropertyRepo,
    readonly logger: CustomLogger
  ) {}

  async deploy(
    user: UserEntity,
    property: PropertyEntity,
    bankAccount: string
  ) {
    try {
      const erc20Document = new ERC20Deploy(user.id, property, bankAccount);
      const ew = new EthersWrapper();
      ew.deployERC20(erc20Document.supply).then(async () => {
        erc20Document.setContractAddres(await ew.contractAddress());
        const result = await this.save(erc20Document);
        this.logger.info('Contract deployed', { erc20: result });
        this._updateProperty(property, result);
        this.logger.info('Property updated with erc20', {
          propertyId: property.id,
        });

        return result;
      });
      return erc20Document;
    } catch (error) {
      this.logger.error(`Error deploying ERC20: ${error.message}`, {
        stack: error.stack,
      });
      throw error;
    }
  }

  async save(erc20Document: ERC20Deploy) {
    return (await this.erc20Repo.save(
      erc20Document.serialize()
    )) as unknown as ERC20Entity;
  }

  private async _updateProperty(property: PropertyEntity, erc20: ERC20Entity) {
    await this.propertyRepo.updateOne(property.id, {
      erc20,
      startAt: new Date(),
    });
  }

  async findAll() {
    return await this.erc20Repo.find({});
  }

  async findOne(query: FindOptionsWhere<ERC20Entity>) {
    return (await this.erc20Repo.find(query))[0];
  }
}
