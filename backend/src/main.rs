use backend::ThreadPool;
use rusqlite::{Connection, Result, params};
use std::{
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    let pool = ThreadPool::new(4);

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        pool.execute(|| {
            handle_connection(stream);
        });
    }
}

fn handle_connection(mut stream: TcpStream) {
    let path = "/home/jjokinen/Documents/hackaton/thingymajig.sql";
    let mut buf_reader = BufReader::new(&stream);
    let mut line = String::new();

    loop {
        println!("{line}");
        line.clear();
        buf_reader
            .read_line(&mut line)
            .expect("Error in line reading");
        if line == "" {
            break;
        }
        if line.trim().is_empty() {
            break;
        }
    }

    line.clear();    
    buf_reader
        .read_line(&mut line)
        .expect("Error in line reading");
    println!("Request: {line:#?}");

    let db = Connection::open(path).expect("DB connection failed");

    println!("{}", db.is_autocommit());

    let response = "HTTP/1.1 200 OK\r\n\r\n";

    stream.write_all(response.as_bytes()).unwrap();
}
