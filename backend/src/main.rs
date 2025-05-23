use backend::ThreadPool;

use actix_web::{web, App, HttpResponse, HttpServer, Responder, post};
use rusqlite::{Connection, Result as SqlResult};
use serde::{Deserialize, Serialize};
use std::{sync::{Arc}, sync::mpsc::channel};
use std::sync::mpsc::Sender;

const DB_PATH: &str = "./uncommon.sqlite";

#[derive(Deserialize)]
struct QueryRequest(Vec<String>);

#[derive(Serialize)]
struct QueryResponse(Vec<String>);

#[post("/")]
async fn query_handler(
    body: web::Json<QueryRequest>,
    pool: web::Data<Arc<ThreadPool>>,
) -> impl Responder {
    let words = body.0 .0.clone();

    // Use channel to get result back
    let (tx, rx) = channel();

    pool.execute(move || {
        let result = query_db(words);
        let _ = tx.send(result);
    });

    // Block on receiving from thread pool thread (not ideal in async, but no extra libs)
    match rx.recv() {
        Ok(Ok(results)) => HttpResponse::Ok().json(QueryResponse(results)),
        Ok(Err(e)) => {
            eprintln!("DB Error: {:?}", e);
            HttpResponse::InternalServerError().body("Database query failed")
        }
        Err(_) => HttpResponse::InternalServerError().body("Failed to receive from thread pool"),
    }
}

fn query_db(words: Vec<String>) -> SqlResult<Vec<String>> {
    let conn = Connection::open(DB_PATH)?;
    let query = sql_call(words);
    let mut stmt = conn.prepare(&query)?;
    let mut rows = stmt.query([])?;

    let mut results = Vec::new();
    while let Some(row) = rows.next()? {
        results.push(row.get(0)?);
    }
    Ok(results)
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

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let pool = Arc::new(ThreadPool::new(4));

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(Arc::clone(&pool)))
            .service(query_handler)
    })
    .bind(("127.0.0.1", 7878))?
    .run()
    .await
}

