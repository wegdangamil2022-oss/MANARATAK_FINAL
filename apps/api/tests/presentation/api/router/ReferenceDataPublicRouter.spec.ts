import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { ReferenceDataPublicRouter } from '../../../../src/presentation/api/router/ReferenceDataPublicRouter';

describe('ReferenceDataPublicRouter', () => {
  const createUseCases = () => ({
    listCountries: vi.fn(),
    listCurrencies: vi.fn(),
    listLanguages: vi.fn(),
    listCities: vi.fn(),
    getCountry: vi.fn(),
  });

  const createApp = (useCases: ReturnType<typeof createUseCases>) => {
    const app = express();
    app.use(express.json());
    app.use('/reference-data', ReferenceDataPublicRouter.create({ referenceDataUseCases: useCases as any }));
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(500).json({ error: err.message });
    });
    return app;
  };

  it('GET /reference-data/countries returns public country list', async () => {
    const useCases = createUseCases();
    useCases.listCountries.mockResolvedValue([{ iso2Code: 'YE', name: 'Yemen' }]);
    const app = createApp(useCases);

    const res = await request(app).get('/reference-data/countries?region=Asia');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(useCases.listCountries).toHaveBeenCalledWith({ region: 'Asia' });
  });

  it('GET /reference-data/countries/:iso2Code returns a country', async () => {
    const useCases = createUseCases();
    useCases.getCountry.mockResolvedValue({ iso2Code: 'EG', name: 'Egypt' });
    const app = createApp(useCases);

    const res = await request(app).get('/reference-data/countries/EG');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ iso2Code: 'EG', name: 'Egypt' });
    expect(useCases.getCountry).toHaveBeenCalledWith('EG');
  });

  it('GET /reference-data/countries/:iso2Code returns 400 when not found (usecase throws)', async () => {
    const useCases = createUseCases();
    useCases.getCountry.mockRejectedValue(new Error('Country not found: XX'));
    const app = createApp(useCases);

    const res = await request(app).get('/reference-data/countries/XX');
    expect(res.status).toBe(400); // Because router has a generic error handler that returns 400
    expect(res.body.error).toBe('Country not found: XX');
  });

  it('GET /reference-data/currencies returns currency list', async () => {
    const useCases = createUseCases();
    useCases.listCurrencies.mockResolvedValue([{ isoCode: 'EGP', name: 'Egyptian Pound' }]);
    const app = createApp(useCases);

    const res = await request(app).get('/reference-data/currencies?q=pound');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(useCases.listCurrencies).toHaveBeenCalledWith({ q: 'pound' });
  });

  it('GET /reference-data/languages returns language list', async () => {
    const useCases = createUseCases();
    useCases.listLanguages.mockResolvedValue([{ isoCode: 'ar', name: 'Arabic' }]);
    const app = createApp(useCases);

    const res = await request(app).get('/reference-data/languages?q=arabic');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(useCases.listLanguages).toHaveBeenCalledWith({ q: 'arabic' });
  });

  it('GET /reference-data/cities parses country filter', async () => {
    const useCases = createUseCases();
    useCases.listCities.mockResolvedValue([{ name: 'Doha', countryIso2Code: 'QA' }]);
    const app = createApp(useCases);

    const res = await request(app).get('/reference-data/cities?countryIso2Code=QA');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(useCases.listCities).toHaveBeenCalledWith({ countryIso2Code: 'QA' });
  });
});
