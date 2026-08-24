import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { ReferenceDataAdminRouter } from '../../../../src/presentation/api/router/ReferenceDataAdminRouter';

describe('ReferenceDataAdminRouter', () => {
  const createUseCases = () => ({
    upsertCountry: vi.fn(),
    upsertCurrency: vi.fn(),
    upsertLanguage: vi.fn(),
    upsertCity: vi.fn(),
    previewCountryImport: vi.fn(),
    previewCountryDerivedReferences: vi.fn(),
    listRegions: vi.fn(),
    listCities: vi.fn(),
  });

  const createApp = (useCases: ReturnType<typeof createUseCases>) => {
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      req.authUserId = 'admin-X';
      next();
    });
    app.use(
      '/admin/reference-data',
      ReferenceDataAdminRouter.create({ referenceDataUseCases: useCases as any }),
    );
    return app;
  };

  it('POST /admin/reference-data/countries/import-preview validates and delegates without applying', async () => {
    const useCases = createUseCases();
    useCases.previewCountryImport.mockReturnValue({
      mode: 'DRY_RUN',
      databaseWrites: 0,
      totalRecords: 1,
    });
    const app = createApp(useCases);
    const input = {
      sourceName: 'countries.xlsx',
      sourceVersion: 'test',
      records: [{ name_en: 'Egypt', iso_alpha2: 'EG', iso_alpha3: 'EGY' }],
    };

    const res = await request(app)
      .post('/admin/reference-data/countries/import-preview')
      .send(input);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ mode: 'DRY_RUN', databaseWrites: 0, totalRecords: 1 });
    expect(useCases.previewCountryImport).toHaveBeenCalledWith(input);
  });

  it('POST /admin/reference-data/countries/derived-reference-preview delegates source candidates', async () => {
    const useCases = createUseCases();
    useCases.previewCountryDerivedReferences.mockReturnValue({
      mode: 'DRY_RUN',
      currencies: [],
      languages: [],
      databaseWrites: 0,
    });
    const app = createApp(useCases);
    const records = [{ iso_alpha2: 'EG', default_currency: 'EGP', default_language: 'ar' }];

    const res = await request(app)
      .post('/admin/reference-data/countries/derived-reference-preview')
      .send({ records });

    expect(res.status).toBe(200);
    expect(res.body.databaseWrites).toBe(0);
    expect(useCases.previewCountryDerivedReferences).toHaveBeenCalledWith(records);
  });

  it('GET /admin/reference-data/regions and cities scope records by country', async () => {
    const useCases = createUseCases();
    useCases.listRegions.mockResolvedValue([{ id: 'r1', countryIso2Code: 'EG', name: 'Cairo' }]);
    useCases.listCities.mockResolvedValue([{ id: 'c1', countryIso2Code: 'EG', name: 'Cairo' }]);
    const app = createApp(useCases);

    const [regions, cities] = await Promise.all([
      request(app).get('/admin/reference-data/regions?countryIso2Code=EG'),
      request(app).get('/admin/reference-data/cities?countryIso2Code=EG'),
    ]);

    expect(regions.status).toBe(200);
    expect(cities.status).toBe(200);
    expect(useCases.listRegions).toHaveBeenCalledWith({ countryIso2Code: 'EG' });
    expect(useCases.listCities).toHaveBeenCalledWith({ countryIso2Code: 'EG' });
  });

  it('PUT /admin/reference-data/countries/:iso2Code validates and delegates', async () => {
    const useCases = createUseCases();
    useCases.upsertCountry.mockResolvedValue({ iso2Code: 'EG', iso3Code: 'EGY', name: 'Egypt' });
    const app = createApp(useCases);

    const payload = { iso3Code: 'EGY', name: 'Egypt', iso2Code: 'XX' }; // The URL param should override 'XX'
    const res = await request(app).put('/admin/reference-data/countries/EG').send(payload);

    expect(res.status).toBe(200);
    expect(res.body.iso2Code).toBe('EG');
    expect(useCases.upsertCountry).toHaveBeenCalledWith(
      { iso2Code: 'EG', iso3Code: 'EGY', name: 'Egypt' },
      expect.objectContaining({ actorId: 'admin-X', source: 'admin-reference-data-api' }),
    );
  });

  it('PUT /admin/reference-data/countries/:iso2Code returns 400 on invalid body', async () => {
    const useCases = createUseCases();
    const app = createApp(useCases);

    const payload = { name: 'Egypt' }; // Missing iso3Code
    const res = await request(app).put('/admin/reference-data/countries/EG').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
    expect(useCases.upsertCountry).not.toHaveBeenCalled();
  });

  it('PUT /admin/reference-data/currencies/:isoCode validates and delegates', async () => {
    const useCases = createUseCases();
    useCases.upsertCurrency.mockResolvedValue({ isoCode: 'EGP', name: 'Egyptian Pound' });
    const app = createApp(useCases);

    const payload = { name: 'Egyptian Pound', isoCode: 'XX' }; // URL param should override 'XX'
    const res = await request(app).put('/admin/reference-data/currencies/EGP').send(payload);

    expect(res.status).toBe(200);
    expect(res.body.isoCode).toBe('EGP');
    expect(useCases.upsertCurrency).toHaveBeenCalledWith(
      { isoCode: 'EGP', name: 'Egyptian Pound' },
      expect.objectContaining({ actorId: 'admin-X', source: 'admin-reference-data-api' }),
    );
  });

  it('PUT /admin/reference-data/currencies/:isoCode returns 400 on invalid body', async () => {
    const useCases = createUseCases();
    const app = createApp(useCases);

    const payload = { isoCode: 'EGP' }; // Missing name
    const res = await request(app).put('/admin/reference-data/currencies/EGP').send(payload);

    expect(res.status).toBe(400);
    expect(useCases.upsertCurrency).not.toHaveBeenCalled();
  });

  it('PUT /admin/reference-data/languages/:isoCode validates and delegates', async () => {
    const useCases = createUseCases();
    useCases.upsertLanguage.mockResolvedValue({ isoCode: 'ar', name: 'Arabic', direction: 'RTL' });
    const app = createApp(useCases);

    const payload = { name: 'Arabic', direction: 'RTL', isoCode: 'xx' }; // URL param should override
    const res = await request(app).put('/admin/reference-data/languages/ar').send(payload);

    expect(res.status).toBe(200);
    expect(res.body.isoCode).toBe('ar');
    expect(useCases.upsertLanguage).toHaveBeenCalledWith(
      { isoCode: 'ar', name: 'Arabic', direction: 'RTL' },
      expect.objectContaining({ actorId: 'admin-X', source: 'admin-reference-data-api' }),
    );
  });

  it('PUT /admin/reference-data/cities validates and delegates', async () => {
    const useCases = createUseCases();
    useCases.upsertCity.mockResolvedValue({ countryIso2Code: 'EG', name: 'Cairo' });
    const app = createApp(useCases);

    const payload = { countryIso2Code: 'EG', name: 'Cairo' };
    const res = await request(app).put('/admin/reference-data/cities').send(payload);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Cairo');
    expect(useCases.upsertCity).toHaveBeenCalledWith(
      { countryIso2Code: 'EG', name: 'Cairo' },
      expect.objectContaining({ actorId: 'admin-X', source: 'admin-reference-data-api' }),
    );
  });

  it('PUT /admin/reference-data/cities returns 400 on invalid body', async () => {
    const useCases = createUseCases();
    const app = createApp(useCases);

    const payload = { name: 'Cairo' }; // Missing countryIso2Code
    const res = await request(app).put('/admin/reference-data/cities').send(payload);

    expect(res.status).toBe(400);
    expect(useCases.upsertCity).not.toHaveBeenCalled();
  });
});
