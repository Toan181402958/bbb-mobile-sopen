import Transaction from './transaction';

export default class MethodTransaction extends Transaction {
  constructor(name, args) {
    super('method', args);
    this.method = name;
  }

  get payload() {
    return {
      id: this.transactionId,
      msg: this.msg,
      method: this.method,
      params: this.params,
    };
  }
}
