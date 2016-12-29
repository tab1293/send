const Readable = require('stream').Readable;
const shortid = require('shortid');

class SocketReadable extends Readable {
    constructor(socket, options = {}) {
        super(options);
        this.socket = socket;
        this.position = options.start ? options.start : 0;
        this.end = options.end;
        this.destroyed = false;
        this.room = shortid.generate();

        console.log('SocketReadable constructor', options.start, options.end);
        this._setupSocket();
    }

    _read(size) {
        if (this.destroyed) {
            console.log('destroyed in read');
            this.push(null);
            return;
        }

        const toRead = Math.min(size, this.end - this.position);
        // console.log('toRead', toRead);
        if (toRead <= 0) {
            this.push(null);
            return;
        }

        // console.log('read', this.position, toRead, this.room);
        this.socket.emit(this.room, this.room, this.position, toRead);
    }

    destroy() {
        if (!this.destroyed) {
            this.destroyed = true;
            console.log('SocketReadable destroy', this.room);
        }
    }

    _setupSocket() {
        this.socket.emit('room', this.room, this.position, this.end);

        this.socket.on(this.room, (data) => {
            // console.log('got data', data.length)
            if (this.destroyed) {
                console.log('destroyed in on data');
                return;
            }

            this.position += data.length;
            this.push(data);
            // console.log('position', this.room, this.position);
        });
    }

}

module.exports = SocketReadable;