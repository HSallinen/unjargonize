use backend::ThreadPool;
use rusqlite::Connection;
use std::{
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
    time::Duration,
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    let pool = ThreadPool::new(4);
    for stream in listener.incoming() {
        if let Ok(stream) = stream {
            pool.execute(|| {
                dbg!(handle_connection(stream));
            });
        }
    }
}

fn handle_connection(mut stream: TcpStream) -> Option<()> {
    let path = /* file path*/;
    let mut buf_reader = BufReader::new(&stream);
    let mut line = String::new();
    let _result = stream.set_read_timeout(Some(Duration::from_secs(2)));
    let _result = stream.set_write_timeout(Some(Duration::from_secs(2)));

    loop {
        println!("{line}");
        line.clear();
        buf_reader.read_line(&mut line).ok()?;
        if line == "" {
            break;
        }
        if line.trim().is_empty() {
            break;
        }
    }

    line.clear();
    buf_reader.read_line(&mut line).ok()?;
    line = line.trim().to_owned();
    println!("Request: {line:#?}");

    let db = Connection::open(path).ok()?;
    println!("{}", db.is_autocommit());

    let vec: Vec<String> = serde_json::from_str(&line).ok()?;

    let mut stmt = db.prepare(&sql_call(vec)).unwrap();
    let mut words_iter = stmt.query([]).ok()?;
    let mut vectwor: Vec<String> = Vec::new();
    while let Ok(Some(row)) = words_iter.next() {
        vectwor.push(row.get(0).ok()?)
    }

    let response = serde_json::to_string(&vectwor);
    stream.write_all(response.ok()?.as_bytes()).ok()?;
    Some(())
}

fn sql_call(values: Vec<String>) -> String {
    let quoted: Vec<String> = values
        .into_iter()
        .map(|v| format!("'{}'", v.replace('\'', "''")))
        .collect();

    format!(
        "SELECT * FROM uncommon WHERE word IN ({});",
        quoted.join(", ")
    )
}

