SELECT u.id, u.secret_page_name, f.filename
FROM urls as u
JOIN files as f  ON u.id = f.url_id
WHERE u.secret_page_name = ?;
