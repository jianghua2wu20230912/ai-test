from app import create_app

app = create_app()

if __name__ == '__main__':
    # Note: For development, app.run() is fine.
    # For production, use a proper WSGI server like Gunicorn or uWSGI.
    app.run(debug=True)
