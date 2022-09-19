declare var MediaRecorder: any;

// tod: define a set of modes

export default class MediaStreamRecorder {
  data: Array<Blob>;
  recorder: any;
  mediaStream: MediaStream;
  /**
   * Get a BlobURL from data
   *
   * @returns {string}
   * @memberof MediaStreamRecorder
   */
  getBlobUrl(): string {
    let blob = new Blob(this.data, {
      type: "audio/wav",
    });
    return URL.createObjectURL(blob);
  }
  /**
   * Get recorded data as Blob
   *
   * @returns {Blob}
   * @memberof MediaStreamRecorder
   */
  getBlob(): Blob {
    let blob = new Blob(this.data, {
      type: "audio/wav",
    });
    return blob;
  }
  getParts(): Blob {
    let blob = new Blob([this.data[0]], {
      type: "audio/wav",
    });
    return blob;
  }
  /**
   *Creates an instance of MediaStreamRecorder.
   * @param {Array<MediaStreamTrack>} tracks
   * @memberof MediaStreamRecorder
   */
  constructor(mediaStream: Promise<MediaStream>) {
    this.recorder = new MediaRecorder(mediaStream, {
      mimeType: "audio/wav;",
    });

    this.recorder.ondataavailable = (e: any) => {
      if (e.data.size > 0) {
        if (this.ondataavailable) {
          this.ondataavailable(e.data);
        } else {
          this.data.push(e.data);
        }
      }
    };
  }

  /**
   * Flush data buffer and get recorded data (blob)
   *
   * @returns {Promise<string>}
   * @memberof MediaStreamRecorder
   */
  flush(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve(this.getBlobUrl());
      this.data = new Array<Blob>();
    });
  }
  /**
   * Stop recording
   *
   * @memberof MediaStreamRecorder
   */
  stop() {
    this.recorder.stop();
  }

  /**
   * Start recording
   *
   * @param {number} n
   * @memberof MediaStreamRecorder
   */
  start(n: number) {
    this.data = new Array<Blob>();
    this.recorder.start(n);
  }
  ondataavailable: (data: any) => void;
}
