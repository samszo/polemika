# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, jsonify
import os
import requests

path = os.path.abspath('.')
app = Flask(__name__, static_url_path='/',  static_folder='/', template_folder=path)

@app.route("/index.html")
def hello():
    return render_template("index.html")

@app.route("/qualification.html")
def qualification():
    return render_template("qualification.html")

@app.route("/analyse.html")
def analyse():
    return render_template("analyse.html")

@app.route("/editor.html")
def editor():
    return render_template("editor.html")

@app.route("/editor-old.html")
def editor_old():
    return render_template("editor-old.html")

@app.route("/argGraph.html")
def argGraph():
    return render_template("argGraph.html")

@app.route("/testMinify.html")
def testMinify():
    return render_template("testMinify.html")

@app.route("/manifest.json")
def manifest():
    return app.send_static_file('manifest.json')

@app.route("/service-worker.js")
def serviceWorker():
    return app.send_static_file('service-worker.js')

@app.route('/proxy')
def proxy():
    url = request.args.get('url', '')
    response = requests.get(url)
    return jsonify(result=response.text)


if __name__ == "__main__":
    app.run(debug=True)