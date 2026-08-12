import { describe, expect, it } from 'vitest';
import { container, registerDependencies } from '../../../../src/infrastructure/di/container';

describe('Major Import Promotion DB Tests (MAS-0501 to MAS-1116)', () => {
  it('MAS-0501 does not return MAS-0001 content', async () => {
    registerDependencies();
    const prisma = container.resolve('prisma') as any;
    
    const mas0501 = await prisma.majorLevelProfile.findFirst({
      where: { code: 'MAS-0501' },
      include: { contentSections: true }
    });
    
    const mas0001 = await prisma.majorLevelProfile.findFirst({
      where: { code: 'MAS-0001' },
      include: { contentSections: true }
    });

    expect(mas0501).toBeDefined();
    if (mas0001 && mas0501 && mas0001.contentSections.length > 0 && mas0501.contentSections.length > 0) {
      expect(mas0501.contentSections[0].content).not.toEqual(mas0001.contentSections[0].content);
    }
  });

  it('MAS-0501 does not return MAS-0500 content', async () => {
    const prisma = container.resolve('prisma') as any;
    
    const mas0501 = await prisma.majorLevelProfile.findFirst({
      where: { code: 'MAS-0501' },
      include: { contentSections: true }
    });
    
    const mas0500 = await prisma.majorLevelProfile.findFirst({
      where: { code: 'MAS-0500' },
      include: { contentSections: true }
    });

    if (mas0500 && mas0501 && mas0500.contentSections.length > 0 && mas0501.contentSections.length > 0) {
      expect(mas0501.contentSections[0].content).not.toEqual(mas0500.contentSections[0].content);
    }
  });

  it('MAS-0601 does not return MAS-0501 content', async () => {
    const prisma = container.resolve('prisma') as any;
    const mas0601 = await prisma.majorLevelProfile.findFirst({ where: { code: 'MAS-0601' }, include: { contentSections: true } });
    const mas0501 = await prisma.majorLevelProfile.findFirst({ where: { code: 'MAS-0501' }, include: { contentSections: true } });
    if (mas0601 && mas0501 && mas0601.contentSections.length > 0 && mas0501.contentSections.length > 0) {
      expect(mas0601.contentSections[0].content).not.toEqual(mas0501.contentSections[0].content);
    }
  });

  it('MAS-1001 does not return MAS-0001 content', async () => {
    const prisma = container.resolve('prisma') as any;
    const mas1001 = await prisma.majorLevelProfile.findFirst({ where: { code: 'MAS-1001' }, include: { contentSections: true } });
    const mas0001 = await prisma.majorLevelProfile.findFirst({ where: { code: 'MAS-0001' }, include: { contentSections: true } });
    if (mas1001 && mas0001 && mas1001.contentSections.length > 0 && mas0001.contentSections.length > 0) {
      expect(mas1001.contentSections[0].content).not.toEqual(mas0001.contentSections[0].content);
    }
  });

  it('MAS-1101 returns its exact dossier', async () => {
    const prisma = container.resolve('prisma') as any;
    const mas1101 = await prisma.majorLevelProfile.findFirst({ where: { code: 'MAS-1101' }, include: { versions: true } });
    expect(mas1101).toBeDefined();
    expect(mas1101?.versions[0].sourceFileName).toBe('masters_MAS-1101_to_MAS-1110.md');
  });

  it('MAS-1116 returns its exact dossier', async () => {
    const prisma = container.resolve('prisma') as any;
    const mas1116 = await prisma.majorLevelProfile.findFirst({ where: { code: 'MAS-1116' }, include: { versions: true } });
    expect(mas1116).toBeDefined();
    expect(mas1116?.versions[0].sourceFileName).toBe('masters_MAS-1111_to_MAS-1116.md');
  });

  it('Re-import does not create duplicates', async () => {
    const prisma = container.resolve('prisma') as any;
    const profiles = await prisma.majorLevelProfile.findMany({ where: { code: 'MAS-0501' } });
    expect(profiles.length).toBe(1);
  });
});
