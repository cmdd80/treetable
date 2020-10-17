export class Device {
    id: number;
    allarmeAttivato: boolean;
    codiceErrore?: string;
    comune: any;
    dataPosa: string;
    dataProvider: string;
    dataUltimaComunicazione?: string;
    deviceCategoryDescription?: string;
    familyName: string;
    friendlyName: string;
    groupName: string;
    indirizzo: string;
    latitudine: number;
    longitudine: number;
    macAddress: string;
    manufacturer: any;
    matricola: string;
    mixedGroupNames?: string[];
    modelId: string;
    modelVersionId: string;
    provincia: any;
    regione: any;
    semplifiedDevice?: any;
    statoDispositivo?: string;
    deviceGroups?: any;
    serialNumber: string;
    manufacturerName?: string;
    comuneNome?: string;
    selected?: boolean;
    connectedDeviceId?: number;
    parent?: number;
  
    constructor() {}
  }