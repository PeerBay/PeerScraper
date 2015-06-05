#PeerScraper

It has a visual easy way of teaching the algorithm to extract the important
content from a website.

Uses SelectorGadget(Plus) for the visual interface and artoo.js to extract
the data and download as a json file.

It works with PeerProxy to bypass the crossdomain issue.

### How to install
```
pip install crossbar
git clone https://github.com/PeerBay/PeerProxy
cd PeerProxy/hello/web
git clone https://github.com/PeerBay/PeerScraper scraper
cd ../../
```
### How to use
```
cd PeerProxy
crossbar start
```
Visit
```
http://localhost:8080/scraper/
```
