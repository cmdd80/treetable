import { Component, OnInit, ViewChild } from "@angular/core";
import * as data from "../../assets/json/devices.json";
import { Device } from "../model/device";
import { Node, Options } from "ng-material-treetable";

import { CustomColumnOrder } from "ng-material-treetable/src/app/treetable/models";

const COLUMNS = [
  { name: "Friendly name", value: "friendlyName", selected: true },
  { name: "Stato dispositivo", value: "statoDispositivo", selected: true },
  { name: "Mac Address", value: "macAddress", selected: true },
  { name: "Serial Number", value: "serialNumber", selected: false },
  { name: "Tipologia", value: "deviceCategoryDescription", selected: true },
  { name: "Produttore", value: "manufacturer.description", selected: false },
  { name: "Indirizzo", value: "indirizzo", selected: true },
  { name: "Data posa", value: "dataPosa", selected: false },
  { name: "Comune", value: "comune.nome", selected: true },
  { name: "Latitudine", value: "latitudine", selected: false },
  { name: "Longitudine", value: "longitudine", selected: false },
  { name: "Gruppi", value: "groups", selected: false },
];

@Component({
  selector: "app-realtable",
  templateUrl: "./realtable.component.html",
  styleUrls: ["./realtable.component.css"],
})
export class RealtableComponent implements OnInit {
  //@ViewChild(TreetableModule) treetable: any;
  @ViewChild("treetable") treetable: any;
  queryComune: string;
  queryMAC: string;

  devices: Device[] = (data as any).default.devices;
  devicesArr: Device[];
  deviceFlatObj: any;
  devicesTree: Node<Device>[];
  devicesOriginalTree: Node<Device>[];
  customColumns: CustomColumnOrder<Device>[];
  options: Options<Device>;

  constructor() {}

  ngOnInit() {
    //Creazione oggetto configurazione a partire dalla loro definizione delle tabelle
    this.customColumns = COLUMNS.map((column) => ({
      key: column.value,
      title: column.name,
    })) as CustomColumnOrder<Device>[];
    this.customColumns.push({ key: "id", title: "Chiave" }); //Aggiunti io a mano nel set di test
    this.customColumns.push({ key: "parent", title: "Genitore" }); //Aggiunti io a mano nel set di test

    //Set table data
    this.options = {
      customColumnOrder: this.customColumns,
    };

    this._loadTreeTable(this.devices);
  }

  _loadTreeTable(devices: Device[]) {
    // funzione che prepara l'array piatto e lo trasforma in un oggetto pronto per esser gerarchizzato
    const deviceFlatObj = this.prepareData(
      devices, //FIXME: se gli arriva un array vuoto schianta, bisognerebbe fargli mostrare almeno l'intestazione della tabella
      this.customColumns.map((column) => column.key)
    ).map((device: Device) => {
      return {
        value: device,
        children: [],
      };
    });

    //creazione della gerarchia
    let tree = this.transformToTree(deviceFlatObj);
    this.devicesTree = tree;
  }

  prepareData(devices: Device[], allowedColumns: string[]): Device[] {
    //appiattisco il json
    let flattenedDevices = devices.map((device) => this.flattenObject(device));
    //tronco alle sole colonne richieste
    let truncatedDevices = flattenedDevices.map((device) => {
      const filtered = Object.keys(device)
        .filter((key) => allowedColumns.includes(key))
        .reduce((obj, key) => {
          obj[key] = device[key];
          return obj;
        }, {});
      return filtered;
    }) as Device[];

    //cerco le proprietà mancanti e le aggiungo
    if (truncatedDevices.length) {
      let intersection = allowedColumns.filter(
        (x) => !Object.keys(truncatedDevices[0]).includes(x)
      );
      intersection = Array.isArray(intersection)
        ? intersection
        : [intersection];

      const keysToAdd = intersection.reduce(
        (obj, key) => ((obj[key] = null), obj),
        {}
      );
      truncatedDevices = truncatedDevices.map((obj) => ({
        ...obj,
        ...keysToAdd,
      }));
    }

    return truncatedDevices;
  }

  flattenObject(ob: object): object {
    var toReturn = {};

    for (var i in ob) {
      if (!ob.hasOwnProperty(i)) continue;

      if (typeof ob[i] == "object" && ob[i] !== null) {
        var flatObject = this.flattenObject(ob[i]);
        for (var x in flatObject) {
          if (!flatObject.hasOwnProperty(x)) continue;

          toReturn[i + "." + x] = flatObject[x];
        }
      } else {
        toReturn[i] = ob[i];
      }
    }
    return toReturn;
  }

  hasDuplicates(array: any) {
    return new Set(array).size !== array.length;
  }

  generateRandomParent(array: any) {
    return array[Math.floor(Math.random() * array.length)];
  }

  getByUniqueKey(
    tree: Node<Device>[],
    key: string,
    value: any
  ): Node<Device> | null {
    var len = tree.length;
    for (var i = 0; i < len; i++) {
      if (tree[i].value[key] === value) {
        return tree[i];
      }
    }

    for (var i = 0; i < len; i++) {
      if (tree[i].children) {
        var node = this.getByUniqueKey(tree[i].children, key, value);
        if (node) {
          return node;
        }
      }
    }
    return null;
  }

  indexInTree(tree: Node<Device>[], key: string, value: any): number {
    var len = tree.length;
    for (var i = 0; i < len; i++) {
      if (tree[i].value[key] === value) {
        return i;
      }
    }
    return -1;
  }

  removeFromTree(tree: Node<Device>[], id: number): Node<Device> | null {
    var node = this.getByUniqueKey(tree, "id", id);
    if (node) {
      if (node.value.parent) {
        var parent = this.getByUniqueKey(tree, "id", node.value.parent);
        if (parent && parent.children) {
          var index = this.indexInTree(parent.children, "id", id);
          if (index != -1) {
            return parent.children.splice(index, 1)[0];
          }
        }
      }

      var index = this.indexInTree(tree, "id", id);
      return tree.splice(index, 1)[0];
    }
    return null;
  }

  transformToTree(array: Node<Device>[]): Node<Device>[] {
    var tree = array.concat([]);
    var len = array.length;
    for (var i = 0; i < len; i++) {
      if (
        array[i].value.parent &&
        array[i].value.parent !== array[i].value.id
      ) {
        var objToMove = this.removeFromTree(tree, array[i].value.id);
        if (objToMove) {
          var parent = this.getByUniqueKey(tree, "id", objToMove.value.parent);
          if (parent) {
            if (!parent.children) {
              parent.children = [];
            }
            parent.children.push(objToMove);
          }
        }
      }
    }
    return tree;
  }

  logToggledNode(node: Node<Device>): void {
    console.log(node);
  }

  onSearch(key: string) {
    let query = key === "macAddress" ? this.queryMAC : this.queryComune;
    //this.treetable.filterData(query, key);

    if (query === "") {
      //FIXME:
      this.devicesTree = this.treetable.originalTree;
      this.treetable._onChange();
      this.treetable.expandAll();
      return;
    }

    const filteredDevices = this.devices.filter(
      (device) => device[key] === query
    );
    const ancestors = this.findAncestors([...filteredDevices]);
    const descendants = this.findDescendants([...filteredDevices]);
    console.log({ ancestors, descendants });

    this._loadTreeTable(
      [...ancestors, ...descendants].filter(
        (v, i, a) => a.findIndex((t) => t.id === v.id) === i  //Rimuove i duplicati
      )
    );
  }

  findAncestors(filteredDevices: Device[]): Device[] {
    for (const device of filteredDevices) {
      if (
        filteredDevices.filter((el) => device.parent === el.id).length === 0
      ) {
        let parent = this.devices.find((el) => device.parent === el.id);
        if (parent) {
          filteredDevices.push(parent);
          this.findAncestors(filteredDevices);
        }
      } else {
        //filteredDevices.splice(filteredDevices.findIndex(v => v.id === device.id), 1);
      }
    }
    return filteredDevices;
  }

  findDescendants(filteredDevices: Device[]): Device[] {
    for (const device of filteredDevices) {
      if (
        filteredDevices.filter((el) => device.id === el.parent).length === 0
      ) {
        let descendants = this.devices.filter((el) => device.id === el.parent);
        descendants = Array.isArray(descendants) ? descendants : [descendants];
        if (descendants.length) {
          descendants.forEach((descendant) => {
            if (
              !filteredDevices.find((device) => device.id === descendant.id)
            ) {
              filteredDevices.push(descendant);
            }
          });
        }
      }
    }
    return filteredDevices;
  }

  onRowClicked() {}
}
