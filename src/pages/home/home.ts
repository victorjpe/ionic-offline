import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit, OnDestroy {

  disconnectSubscription;
  connectSubscription;
  sqlConn: SQLiteObject;
  public connectionExist = true;
  public data: any = '';

  ngOnInit(): void {
    // watch network for a disconnect
    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.connectionExist = false;
      console.log('network was disconnected :-(');
    });

    //DB connection
    this.sqlite.create({
      name: 'offline',
      location: 'default'
    }).then((db: SQLiteObject) => {
      this.sqlConn = db;
      this.createDB();
    })
      .catch(e => console.log(e));;

    // watch network for a connection
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      // We just got a connection but we need to wait briefly
      // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.
      setTimeout(() => {
        if (this.network.type === 'wifi') {
          this.connectionExist = true;
          console.log('we got a wifi connection, woohoo!');
        }
      }, 3000);
    });
    this.getOrders();
  }

  constructor(public navCtrl: NavController, private network: Network, private sqlite: SQLite, private http: HttpClient) { }

  getOrders() {
    // if(this.connectionExist){
    this.http.get('https://randomuser.me/api/').subscribe((data: any) => {
      this.data = data.results[0].email;
      this.insertValues(this.data);
    });
    // } else {
    //   this.getSQLData();
    // }

  }

  getSQLData() {

    this.sqlConn.executeSql('select * from randomData limit 1', {})
      .then((data) => {
        console.log('Executed SQL', data)
        alert(data);
      })
      .catch(e => console.log(e));
  }

  clearEmail() {
    this.data = "";
  }

  createDB() {

    this.sqlConn.executeSql('create table randomData(email VARCHAR(32))', {})
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log('gui', e));
  }

  insertValues(email: string) {
    this.sqlConn.executeSql('insert into randomData VALUES (?)',[email])
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log(e));
  }


  ngOnDestroy(): void {
    // stop disconnect watch
    this.disconnectSubscription.unsubscribe();
    this.connectSubscription.unsubscribe();
    this.sqlConn.close();

  }

}

