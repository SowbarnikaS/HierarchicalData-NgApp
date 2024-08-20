import { Component } from '@angular/core';
import data from '../assets/data/table-data.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'hierarchical-table';
  tableData: any = [];
  grandTotal: number = 0;

  ngOnInit() {
    this.flattenData();
    this.calcGrandTotal();
  }

  //for easy view manipulation - flattening data
  flattenData() {
    data.rows.forEach((row) => {
      this.tableData.push({
        id: row.id,
        label: row.label,
        value: row.value,
        children: JSON.parse(JSON.stringify(row.children)),
        variance: 0,
      });
      if (row.children.length > 0) {
        row.children.forEach((cRow) => {
          this.tableData.push({
            id: cRow.id,
            label: cRow.label,
            value: cRow.value,
            variance: 0,
            parentId: row.id,
          });
        });
      }
    });
  }

  calcGrandTotal() {
    this.grandTotal = 0;
    this.tableData.map((e: any) => {
      if (e.children) {
        this.grandTotal += e.value;
      }
    });
  }

  allocatePercent(row: any, index: number) {
    const userInput = parseFloat(
      (<HTMLInputElement>document.getElementById(row.id)).value
    );
    if (userInput) {
      const userValue =
        this.tableData[index].value +
        (this.tableData[index].value * userInput) / 100;
      if (row.parentId) {
        this.tableData[index].value = userValue;
        this.calcChangesOnChild(row, index);
      } else {
        this.calcChangesOnParent(index, userValue);
      }
      this.calcGrandTotal();
      (<HTMLInputElement>document.getElementById(row.id)).value = '';
    }
  }

  allocateValue(row: any, index: number) {
    const userInput = parseFloat(
      (<HTMLInputElement>document.getElementById(row.id)).value
    );
    if (userInput) {
      if (row.parentId) {
        this.tableData[index].value = userInput;
        this.calcChangesOnChild(row, index);
      } else {
        this.calcChangesOnParent(index, userInput);
      }
      this.calcGrandTotal();
      (<HTMLInputElement>document.getElementById(row.id)).value = '';
    }
  }

  calcParentVariance(tableIndex: number) {
    let originalData = data.rows.find(
      (row) => row.id === this.tableData[tableIndex].id
    );
    let originalVal = originalData?.value || 0;
    this.tableData[tableIndex].variance = (
      ((this.tableData[tableIndex].value - originalVal) / originalVal) *
      100
    ).toFixed(2);
  }

  calcChildVariance(tableIndex: number, tableRow: any) {
    let parentData = data.rows.find((row) => row.id === tableRow.parentId);
    let originalData = parentData?.children.find(
      (row) => row.id === tableRow.id
    );
    let originalVal = originalData?.value || 0;
    this.tableData[tableIndex].variance = (
      ((this.tableData[tableIndex].value - originalVal) / originalVal) *
      100
    ).toFixed(2);
  }

  calcChangesOnChild(row: any, index: number) {
    this.calcChildVariance(index, row);
    const parentIndex = this.tableData.findIndex(
      (r: any) => r.id === row.parentId
    );
    const childIndex = this.tableData[parentIndex].children.findIndex(
      (e: any) => e.id === row.id
    );
    //make sure table data - parent rows data reflects new children value as per user input
    this.tableData[parentIndex].children[childIndex].value =
      this.tableData[index].value;
    let subTotal = this.tableData[parentIndex].children.reduce(function (
      total: number,
      obj: any
    ) {
      return total + obj.value;
    },
    0);
    this.tableData[parentIndex].value = subTotal;
    this.calcParentVariance(parentIndex);
  }

  calcChangesOnParent(index: number, userValue: number) {
    this.tableData[index].children.map((c: any) => {
      const childValue =
        ((c.value / this.tableData[index].value) * 100 * userValue) / 100;
      c.value = childValue;
      let childIndex = this.tableData.findIndex((e: any) => e.id === c.id);
      this.tableData[childIndex].value = childValue;
      this.calcChildVariance(childIndex, this.tableData[childIndex]);
    });
    this.tableData[index].value = userValue;
    this.calcParentVariance(index);
  }
}
