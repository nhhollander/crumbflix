#!/bin/bash

(cd server; npm run run &);
(cd client; npm run debug &);
