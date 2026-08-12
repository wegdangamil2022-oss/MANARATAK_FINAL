import { IDegreeLevelRepository, UpsertDegreeLevelDto } from '@manaratak/domain';

export class DegreeLevelSeedService {
  constructor(private readonly repository: IDegreeLevelRepository) {}

  async seedDegreeLevels(): Promise<void> {
    const initialDegreeLevels: UpsertDegreeLevelDto[] = [
      {
        canonicalCode: 'DIPLOMA',
        nameEn: 'Diploma',
        nameAr: 'دبلوم',
        displayRank: 10,
        status: 'ACTIVE',
      },
      {
        canonicalCode: 'ASSOCIATE',
        nameEn: 'Associate Degree',
        nameAr: 'درجة مشارك',
        displayRank: 20,
        status: 'ACTIVE',
      },
      {
        canonicalCode: 'BACHELOR',
        nameEn: 'Bachelor',
        nameAr: 'بكالوريوس',
        displayRank: 30,
        status: 'ACTIVE',
      },
      {
        canonicalCode: 'MASTER',
        nameEn: 'Master',
        nameAr: 'ماجستير',
        displayRank: 40,
        status: 'ACTIVE',
      },
      {
        canonicalCode: 'FELLOWSHIP',
        nameEn: 'Fellowship',
        nameAr: 'زمالة',
        displayRank: 50,
        status: 'ACTIVE',
      },
      {
        canonicalCode: 'DOCTORATE',
        nameEn: 'Doctorate',
        nameAr: 'دكتوراه',
        displayRank: 60,
        status: 'ACTIVE',
      },
      {
        canonicalCode: 'CERTIFICATE',
        nameEn: 'Certificate',
        nameAr: 'شهادة',
        displayRank: 70,
        status: 'ACTIVE',
      }
    ];

    for (const level of initialDegreeLevels) {
      await this.repository.upsertDegreeLevel(level);
    }
  }
}
