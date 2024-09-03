# iClock ADMS (Automatic Data Master Server) Push Protocol
The iClock ADMS is the protocol used by ZKLink Time Attendance Terminals. The Push Protocol means only the terminal can initiate connections, it would send a request on a set interval to poll the ADMS server for any commands and also send a request every time there is an event. This documentation will be structured based on the endpoints and the relevant data types.

This project and protocol documentation is partially based on documentations from [docs.nufaza.com](https://docs.nufaza.com/docs/devices/zkteco_attendance/push_protocol/) and with some adjustments based on observations of a [Solution X100-C](https://www.solution.co.id/x100c.php) (Which seems to be a rebrand of the [ZKTeco U300-C](https://www.zkteco.com/en/Classic/U300-C)). Compatibility with other terminals has not been tested.

## **Handshake (GET /iclock/cdata)**
Example request from terminal:
```http
GET /iclock/cdata?SN=SERIAL87654321&options=all&language=73&pushver=2.4.0 HTTP/1.1
Host: 10.10.2.87:8081
User-Agent: iClock Proxy/1.09
Connection: close
Accept: */*

```
Example response from server:
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Date: Mon, 05 Aug 2024 05:40:42 GMT
Connection: close
Transfer-Encoding: chunked

128
GET OPTION FROM: SERIAL87654321
STAMP=9999
ATTLOGSTAMP=1722836442
OPERLOGStamp=1722836442
ATTPHOTOStamp=1722836442
ErrorDelay=30
Delay=10
TransTimes=00:00;23:59
TransInterval=1
TransFlag=TransData AttLog	OpLog	EnrollUser	ChgUser	EnrollFP	ChgFP	FPImag
TimeZone=7
Realtime=1
Encrypt=None
0
```

TBD, refer to [docs.nufaza.com: Inisialisasi Pertukaran Informasi antara Client dan Server]([docs.nufaza.com](https://docs.nufaza.com/docs/devices/zkteco_attendance/push_protocol/#inisialisasi-pertukaran-informasi-antara-client-dan-server))

## **ReceiveData (POST /iclock/cdata)**
This is the main endpoint where data is sent by the terminals. 

Example request from terminal:
```http
POST /iclock/cdata?SN=SERIAL87654321&table=ATTLOG&Stamp=9999 HTTP/1.1
Host: 10.10.2.87:8081
User-Agent: iClock Proxy/1.09
Connection: close
Accept: */*
Content-Length: 35

1156	2024-08-05 12:40:57	1	1		0	0	

```
This request contains some data in the query parameters such as the serial number (SN) and the table name of the data that will be given. Currently there are 2 tables that has been observed:
- ATTLOG (An attendance event, such as when a registed person scans their fingerprint)
- OPERLOG (An operational event, such as when someone opens menus and create or modify users)

### - ATTLOG Table
Request:
```http
POST /iclock/cdata?SN=SERIAL87654321&table=ATTLOG&Stamp=9999 HTTP/1.1
Host: 10.10.2.87:8081
User-Agent: iClock Proxy/1.09
Connection: close
Accept: */*
Content-Length: 35

1156	2024-08-05 12:40:57	1	1		0	0	

```
The ATTLOG content body consists of tab-separated values. The format of the values are as follows:
1. Pin (User ID; Here the term "pin" seems to refer to the id of the user)
2. Date and Time
3. Status
4. Verify
5. Workcode
6. Reserved
7. Reserved

### - OPERLOG Table
There are a few variants of the OPERLOG. Currently there are 3 OPERLOG operations that has been observed:
- OPLOG (General operation logging)
- USER (Creation or modification of a user)
- FP (Creation or modification of a fingerprint)

The OPERLOG row body consists of two sections separated by spaces, the operation name and the actual contents. Example Request containing OPLOG, USER, and FP:
```http
POST /iclock/cdata?SN=SERIAL87654321&table=OPERLOG&OpStamp=9999 HTTP/1.1
Host: 10.10.2.87:8081
User-Agent: iClock Proxy/1.09
Connection: close
Accept: */*
Content-Length: 42

OPLOG 70	0	2024-08-05 16:08:50	1157	0	0	0
USER PIN=1157	Name=Isaaa001	Pri=0	Passwd=	Card=	Grp=1	TZ=0000000100000000	Verify=0	ViceCard=
FP PIN=1160	FID=0	Size=1608	Valid=1	TMP=TfdT{...Fingerprint Data...}AA==

```
Written with clearer whitespaces:
```
OPLOG<space>70<tab>0<tab>2024-08-05 16:08:50<tab>1157<tab>0<tab>0<tab>0
USER<space>PIN=1157<tab>Name=Isaaa001<tab>Pri=0<tab>Passwd=<tab>Card=<tab>Grp=1<tab>TZ=0000000100000000<tab>Verify=0<tab>ViceCard=
FP<space>PIN=1160<tab>FID=0<tab>Size=1608<tab>Valid=1<tab>TMP=TfdT{...Fingerprint Data...}AA==
```

#### OPLOG Operation
Request:
```http
POST /iclock/cdata?SN=SERIAL87654321&table=OPERLOG&OpStamp=9999 HTTP/1.1
Host: 10.10.2.87:8081
User-Agent: iClock Proxy/1.09
Connection: close
Accept: */*
Content-Length: 42

OPLOG 70	0	2024-08-05 16:08:50	1157	0	0	0

```
The contents of an OPLOG Operation (`70<tab>0<tab>2024-08-05 16:08:50<tab>1157<tab>0<tab>0<tab>0`) as observed uses the following format:
1. Operation Type
2. Unknown (Named "status" in implementation, "OpWho" in the Nufaza documentation)
3. Date and Time
4. Pin (User ID)
5. Value 1
6. Value 2
7. Value 3
The documentations from [docs.nufaza.com](https://docs.nufaza.com/docs/devices/zkteco_attendance/push_protocol/#pengiriman-data-operasional) provides a list of Operation Types:

| Type | Description                          |
|------|--------------------------------------|
| 0    | Startup                              |
| 1    | Shutdown                             |
| 2    | Authentication fails                 |
| 3    | Alarm                                |
| 4    | Access menu                          |
| 5    | Change settings                      |
| 6    | Enroll fingerprint                   |
| 7    | Enroll password                      |
| 8    | Enroll HID card                      |
| 9    | Delete user                          |
| 10   | Delete fingerprint                   |
| 11   | Delete password                      |
| 12   | Delete RF card                       |
| 13   | Clear data                           |
| 14   | Create MF card                       |
| 15   | Enroll MF card                       |
| 16   | Register MF card                     |
| 17   | Delete MF card registration          |
| 18   | Clear MF card content                |
| 19   | Move enrolled data into the card     |
| 20   | Copy data in the card to the machine |
| 21   | Set time                             |
| 22   | Delivery configuration               |
| 23   | Delete entry and exit records        |
| 24   | Clear administrator privilege        |

But I have observed Operation Types with values of 30 and 70 during the enrollment of a user. This part of the Nufaza documentation also shows a different format (`OPLOGS<space>OpType<tab>OpWho<tab>OpTime<tab>Value1<tab>Value2<tab>Value3<tab>Reserved`) where the "2. Unknown" field is actually "OpWho", the documentation never explains what this field means. The Nufaza documentation also shows an OpCode table, but again this is the only time it's ever mentioned and it's not explained where the OpCode field is.

#### USER Operation
Request
```http
POST /iclock/cdata?SN=SERIAL87654321&table=OPERLOG&OpStamp=9999 HTTP/1.1
Host: 10.10.2.87:8081
User-Agent: iClock Proxy/1.09
Connection: close
Accept: */*
Content-Length: 91

USER PIN=1160	Name=Isa004	Pri=0	Passwd=	Card=	Grp=1	TZ=0000000100000000	Verify=0	ViceCard=

```
The contents of a USER Operation (`PIN=1160<tab>Name=Isa004<tab>Pri=0<tab>Passwd=<tab>Card=<tab>Grp=1<tab>TZ=0000000100000000<tab>Verify=0<tab>ViceCard=`) is list of tab-separated key-value pairs.

#### FP Operation
Request:
```http
POST /iclock/cdata?SN=SERIAL87654321&table=OPERLOG&OpStamp=9999 HTTP/1.1
Host: 10.10.2.87:8081
User-Agent: iClock Proxy/1.09
Connection: close
Accept: */*
Content-Length: 1649

FP PIN=1160	FID=0	Size=1608	Valid=1	TMP=TfdT{...Fingerprint Data...}AA==

```
The contents of an FP Operation (`PIN=1160<tab>FID=0<tab>Size=1608<tab>Valid=1<tab>TMP=TfdT{...Fingerprint Data...}AA==`) is a list of tab-separated key-value pairs.

### ReceiveData Response
For ReceiveData requests, the server only needs to respond with OK: and then the number of rows received.

For example, the terminal requests:
```http
POST /iclock/cdata?SN=SERIAL87654321&table=OPERLOG&OpStamp=9999 HTTP/1.1
Host: 10.10.2.87:8081
User-Agent: iClock Proxy/1.09
Connection: close
Accept: */*
Content-Length: 83

OPLOG 30	0	2024-08-05 12:48:25	1160	0	0	0
OPLOG 6	0	2024-08-05 12:48:25	1160	0	0	0

```
The server can then respond with:
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Date: Mon, 05 Aug 2024 05:49:55 GMT
Connection: close
Transfer-Encoding: chunked

5
OK: 2
0


```


## **SendData (GET /iclock/getRequest)**
Terminal will send a heartbeat to this endpoint with a serial number, occasionally with an update for the latest information of the terminal. The server can reply to this request with a command to send to the terminal.

TBD, refer to [docs.nufaza.com: Mengirim Rekap Informasi Terkini](https://docs.nufaza.com/docs/devices/zkteco_attendance/push_protocol/#mengirim-rekap-informasi-terkini) and [docs.nufaza.com: Mengambil Perintah dari Pusat](https://docs.nufaza.com/docs/devices/zkteco_attendance/push_protocol/#mengambil-perintah-dari-pusat)

## **StatusData (POST /devicecmd)**
Command responses seem to get sent to /iclock/cdata just with no table. Which seems to be different to the documentations below.
TBD, refer to [docs.nufaza.com: Membalas Perintah dari Pusat](https://docs.nufaza.com/docs/devices/zkteco_attendance/push_protocol/#membalas-perintah-dari-pusat)

