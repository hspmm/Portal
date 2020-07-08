import { TestBed } from '@angular/core/testing';

import { PortalServicesService } from './portal-services.service';

describe('EcPortalServicesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PortalServicesService = TestBed.get(PortalServicesService);
    expect(service).toBeTruthy();
  });
});
