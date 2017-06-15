import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-order-sql-helper',
  templateUrl: './order-sql-helper.component.html',
  styleUrls: ['./order-sql-helper.component.css']
})
export class OrderSqlHelperComponent implements OnInit {

  constructor() { }

  inputArea1: string;
  inputArea2: string;
  outputArea1: string;
  outputArea2: string;

  ngOnInit() {
  }

  getValueAsArray(inputArea) {
    return _.map(inputArea.replace(/\s/g, "\n").replace(/[,'"]+/g, "").split("\n").filter(Boolean), _.trim);
  }

  convertUOrderIds(): void {
    if (!this.inputArea1) { this.outputArea1 = ''; return; }
    let temp = this.getValueAsArray(this.inputArea1);
    let temp1 = '';
    temp.forEach(function(value) {
      if (temp1.length > 1) temp1 += ",";
      temp1 += ("'" + value + "'");
    });
    temp1 = "db2 \"select orders_id from orders where ormorder in (" + temp1 + ")\"";
    this.outputArea1 = temp1;
    this.outputArea2 = '';
    this.inputArea1 = '';
    for (const c of temp){
      this.inputArea1 += c + "\n";
    }
  }

  convertOrderIdsToSql(): void {
    if (!this.inputArea2) { this.outputArea1 = ''; this.outputArea2 = ''; return; }
    let temp = this.getValueAsArray(this.inputArea2);
//    let temp1 = "db2 \"select orders_id,ormorder,status,timeplaced,lastupdate from orders where orders_id in (" + temp.toString() + ")\"\n";
    let temp1 = `select DISTINCT orders.orders_id,orders.ormorder,orders.status,pattrvalue.stringvalue as SALES_CHANNEL,orderblk.resolved,orderitems.shipmode_id, shipmode.carrier,orders.timeplaced,orders.lastupdate from orders left outer join orderblk on (orders.orders_id = orderblk.orders_id) left outer join orderitems on (orderitems.orders_id = orders.orders_id) left outer join shipmode on (orderitems.shipmode_id = shipmode.shipmode_id) left outer join pattrvalue on (pattrvalue.pattribute_id=33 AND pattrvalue.orderitems_id in (select orderitems_id from orderitems where orders_id in (${temp}))) where orders.orders_id in (${temp}) order by orders_id\n`
    
    let temp2 = "db2 \"update ordrelease set field1=0 where orders_id in (" + temp.toString() + ")\"\n";
    temp2 += "db2 \"update orderblk set resolved=1 where orders_id in (" + temp.toString() + ")\"\n";
    temp2 += "db2 \"update orders set status='H',blocked=100 where orders_id in (" + temp.toString() + ")\"\n";
    temp2 += temp1;
    this.outputArea1 = temp1;
    this.outputArea2 = temp2;
    this.inputArea2 = '';
    for (const c of temp){
      this.inputArea2 += c + "\n";
    }
  }

  exportPackingSlip(): void {
    let uOrderIds = this.getValueAsArray(this.inputArea1);
    let orderIds = this.getValueAsArray(this.inputArea2);
    let sqlLines = _.zipWith(uOrderIds, orderIds, function(uOrderId, orderId) {
      return `db2 "export to ${uOrderId}_Order_XML of del lobs to /tmp/ select packslipxml from ordrelease where orders_id = ${orderId}"\n`;
    });
    this.outputArea2 = '';
    this.outputArea1 = '';
    for (const line of sqlLines){
      this.outputArea2 += line;
    }
  }

  getCurrentMonthOrdersExportSQL(): void {
    var formatter = new Intl.DateTimeFormat("en-us", { month: "long" });
    var date = new Date();
    var monthName = formatter.format(date);
    var month = date.getMonth()+1; // getMonth has 0 starting index
    var year = date.getFullYear();
    var sql = `cd /tmp\n`;
    sql += `db2 "export to Order_Summary_${monthName}_2017.lob of del lobs to /tmp/ select DISTINCT orders.orders_id,TRIM(orders.ormorder) AS ORMORDER,pattrvalue.stringvalue AS SALES_CHANNEL_ID ,TRIM(orders.status) AS STATUS,orderblk.resolved,orderitems.shipmode_id,TRIM(shipmode.carrier) AS CARRIER,VARCHAR_FORMAT(orders.timeplaced, 'YYYY-MM-dd') AS DATE,orders.timeplaced,orders.lastupdate from orders left outer join orderblk on (orders.orders_id = orderblk.orders_id) left outer join orderitems on (orderitems.orders_id = orders.orders_id) left outer join shipmode on (orderitems.shipmode_id = shipmode.shipmode_id) left outer join pattrvalue on (orderitems.orderitems_id = pattrvalue.orderitems_id AND pattrvalue.pattribute_id = 33) where orders.timeplaced > '${year}-${month}-01' order by orders_id"\n`;
    sql += `chmod 7777 Order_Summary_${monthName}_2017.lob\n\n`;
    this.outputArea2 = sql.toString();
  }

  getBadOrdersSQL(): void {
    var sql = `db2 "select DISTINCT orders.orders_id,orders.ormorder,orders.status,orderblk.resolved,orderitems.shipmode_id, shipmode.carrier,orders.timeplaced,orders.lastupdate from orders left outer join orderblk on (orders.orders_id = orderblk.orders_id) left outer join orderitems on (orderitems.orders_id = orders.orders_id) left outer join shipmode on (orderitems.shipmode_id = shipmode.shipmode_id)  left outer join pattrvalue on (orderitems.orderitems_id = pattrvalue.orderitems_id) left outer join pattribute on (pattribute.pattribute_id = pattrvalue.pattribute_id AND pattrvalue.pattribute_id = 33) where orders.status in ('F','U') AND orders.timeplaced > (CURRENT DATE - 3 DAYS) AND pattribute.name = 'SALES_CHANNEL_ID' order by orders_id"\n\n`;
    this.outputArea2 = sql.toString();
  }

  getDBU(): void {
    this.outputArea2 = `(su wscomusr)\n(db2 connect to live)\n`;
  }

}
