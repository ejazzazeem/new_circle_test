export class ApiConfiguration {
  constructor(public webApiBaseUrl: string,
              public releaseNumber: string,
              public testAuth: boolean,
              public ssoAuthUrl: string,
              public ssoAuthUrlLanding: string,
              public sessionTimeout: string,
              public patientConsentWebformUrl: string,
              public downUrl: string) {
  }
}
