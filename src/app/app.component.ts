import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Node } from "ng-material-treetable";


@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  family = [];
  familyFlat = [];
  familytree: Node<Person>[];
  query: string;

  @ViewChild("treetable") treetable: ElementRef;

  constructor(){
  }

  ngOnInit(): void {
    
    this.familyFlat = [
      { id: 1, nome: "Giovanni", cognome: "De Dominicis" },
      { id: 2, nome: "Claudio", cognome: "De Dominicis", parent: 1 },
      { id: 3, nome: "Remo", cognome: "De Dominicis", parent: 1 },
      { id: 4, nome: "Chiara", cognome: "De Dominicis", parent: 2 },
      { id: 5, nome: "Francesco", cognome: "De Dominicis", parent: 2 },
      { id: 6, nome: "Valeria", cognome: "Ferrari", parent: 4 },
      { id: 7, nome: "Francesco", cognome: "Ferrari", parent: 4 },
      { id: 8, nome: "Francesco", cognome: "Conti" },
      { id: 9, nome: "Maria Teresa", cognome: "Conti" , parent: 8},
      { id: 10, nome: "Piergiuseppe", cognome: "Conti" , parent: 8},
      { id: 11, nome: "Paolo", cognome: "Ferrari" , parent: 9},
      { id: 12, nome: "Andrea", cognome: "Ferrari" , parent: 9},
    ];

    this.family = this.familyFlat.map((person: Person) => {
      return {
        value: person,
        children: [],
      };
    });

    let tree = this.transformToTree(this.family);
    console.log({ tree });
    this.familytree = tree;
  }

  getByUniqueKey(tree: Node<Person>[], key: string, value: any): Node<Person> | null {
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

  indexInTree(tree: Node<Person>[], key: string, value: any): number {
    var len = tree.length;
    for (var i = 0; i < len; i++) {
      if (tree[i].value[key] === value) {
        return i;
      }
    }
    return -1;
  }

  removeFromTree(tree: Node<Person>[], id: number): Node<Person> | null {
    var node = this.getByUniqueKey(tree, 'id', id);
    if (node) {
      if (node.value.parent) {
        var parent = this.getByUniqueKey(tree, 'id', node.value.parent);
        if (parent && parent.children) {
          var index = this.indexInTree(parent.children, 'id', id);
          if (index != -1) {
            return parent.children.splice(index, 1)[0];
          }
        }
      }

      var index = this.indexInTree(tree, 'id', id);
      return tree.splice(index, 1)[0];
    }
    return null;
  }

  transformToTree(array: Node<Person>[]): Node<Person>[] {
    console.log("here");
    var tree = array.concat([]);
    var len = array.length;
    for (var i = 0; i < len; i++) {
      if (
        array[i].value.parent &&
        array[i].value.parent !== array[i].value.id
      ) {
        var objToMove = this.removeFromTree(tree, array[i].value.id);
        if (objToMove) {
          var parent = this.getByUniqueKey(tree, 'id', objToMove.value.parent);
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

  logToggledNode(node: Node<Person>): void {
    console.log(node);
    console.log(this.treetable);
    console.log(this.query);
  }

  onSearch() : void {
    console.log(this.query);
  }

  onRowClicked(element: any): void{
    console.log({element});
  }
}

export interface Person {
  id: number;
  nome: string;
  cognome: string;
  parent?: number;
}
