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
    debugger;
    // watch network for a disconnect
    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.connectionExist = false;
      console.log('network was disconnected :-(');
    });

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
    this.createDB();
  }

  constructor(public navCtrl: NavController, private network: Network, private sqlite: SQLite, private http: HttpClient) {

  }

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
    this.sqlite.create({
      name: 'offline',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT * FROM randomData LIMIT 1', {})
        .then((data) => {
          debugger;
          let email = data.rows.item(0).email;
          console.log('Executed SQL', email)
          this.data = email;
        })
        .catch(e => console.log(e));
    })
      .catch(e => console.log(e));

  }

  clearEmail() {
    this.data = "";
  }

  createDB() {
    debugger;
    this.sqlite.create({
      name: 'offline',
      location: 'default'
    }).then((db: SQLiteObject) => {

      db.executeSql('DROP TABLE randomData', {});
      db.executeSql('CREATE TABLE IF NOT EXISTS randomData(sino INTEGER primary key, email VARCHAR(32))', {})
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log('gui', e));
      this.getOrders();
    })
      .catch(e => console.log(e));

  }

  insertValues(email: string) {
    debugger;
    this.sqlite.create({
      name: 'offline',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('INSERT OR REPLACE INTO randomData VALUES (?,?)', [1, email])
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log(e));
    })
      .catch(e => console.log(e));

  }


  ngOnDestroy(): void {
    // stop disconnect watch
    this.disconnectSubscription.unsubscribe();
    this.connectSubscription.unsubscribe();

  }

}

