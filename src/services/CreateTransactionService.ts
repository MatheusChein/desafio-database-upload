import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

import CreateCategoryService from './CreateCategoryService';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: TransactionDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const createCategory = new CreateCategoryService();

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome') {
      if (value > total) {
        throw new AppError('Outcome value is bigger than allowed');
      }
    }

    const filteredCategory = await createCategory.execute(category);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: filteredCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
