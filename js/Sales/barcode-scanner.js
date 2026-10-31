// ======================================
// TREEHOUSE POS
// SALES
// BARCODE CAMERA SCANNER
// ======================================

const SalesBarcodeScanner = {

    stream: null,
    detector: null,
    scanning: false,
    controls: null,

    lastBarcode: "",
    lastDetectedTime: 0,
    scanCount: 0,

   /* ======================================
   AUDIO BEEP
====================================== */

audioContext: null,

playBeep(type = "success") {

    try {

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContextClass) {
            return;
        }

        if (!this.audioContext) {

            this.audioContext =
                new AudioContextClass();

        }

        const context =
            this.audioContext;

        const playSound = () => {

            const oscillator =
                context.createOscillator();

            const gain =
                context.createGain();

            const isError =
                type === "error";

            oscillator.type = "square";

            oscillator.frequency.value =
                isError ? 350 : 2200;

            const now =
                context.currentTime;

            const duration =
                isError ? 0.35 : 0.20;

            gain.gain.setValueAtTime(
                0.0001,
                now
            );

            gain.gain.exponentialRampToValueAtTime(
                0.8,
                now + 0.01
            );

            gain.gain.setValueAtTime(
                0.8,
                now + duration * 0.7
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + duration
            );

            oscillator.connect(gain);
            gain.connect(context.destination);

            oscillator.start(now);

            oscillator.stop(
                now + duration + 0.01
            );

        };

        if (context.state === "suspended") {

            context.resume()
                .then(playSound)
                .catch(error => {

                    console.warn(
                        "SALES BARCODE AUDIO ERROR:",
                        error
                    );

                });

        } else {

            playSound();

        }

    } catch (error) {

        console.warn(
            "SALES BARCODE AUDIO ERROR:",
            error
        );

    }

},

    /* ======================================
       RENDER MODAL
    ====================================== */

    renderModal() {

        let modal =
            document.getElementById(
                "sales-barcode-scanner"
            );

        if (modal) {
            return;
        }

        const container =
            document.body;

        if (!container) {
            return;
        }

        modal =
            document.createElement("div");

        modal.id =
            "sales-barcode-scanner";

        modal.className =
            "sales-barcode-scanner";

        modal.hidden = true;

        modal.innerHTML = `

            <div
                class="sales-barcode-scanner-overlay"
            >

                <div
                    class="sales-barcode-scanner-container"
                >

                    <div
                        class="sales-barcode-scanner-header"
                    >

                        <strong>
                            Scan Barcode
                        </strong>

                        <button
                            type="button"
                            class="sales-barcode-scanner-close"
                            id="sales-barcode-scanner-close"
                            aria-label="Tutup scanner"
                        >
                            ×
                        </button>

                    </div>

                    <div
                        class="sales-barcode-scanner-preview"
                    >

                        <video
                            id="sales-barcode-scanner-video"
                            class="sales-barcode-scanner-video"
                            autoplay
                            muted
                            playsinline
                        ></video>

                        <div
                            class="sales-barcode-scanner-frame"
                        >

                            <div
                                class="sales-barcode-scanner-line"
                            ></div>

                        </div>

                        <div
                            class="sales-barcode-scanner-message"
                            id="sales-barcode-scanner-message"
                        >
                            Menyiapkan kamera...
                        </div>

                    </div>

                </div>

            </div>

        `;

        container.appendChild(modal);

        const closeButton =
            document.getElementById(
                "sales-barcode-scanner-close"
            );

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                () => {
                    this.close();
                }
            );

        }

    },

    /* ======================================
       OPEN
    ====================================== */

    async open() {

        this.renderModal();

        const modal =
            document.getElementById(
                "sales-barcode-scanner"
            );

        const video =
            document.getElementById(
                "sales-barcode-scanner-video"
            );

        const message =
            document.getElementById(
                "sales-barcode-scanner-message"
            );

        if (!modal || !video) {

            console.error(
                "Elemen scanner barcode Sales tidak ditemukan."
            );

            return;
        }

        modal.hidden = false;

        this.scanning = false;
        this.controls = null;
        this.stream = null;
        this.lastBarcode = "";
        this.lastDetectedTime = 0;
        this.scanCount = 0;

        if (message) {
            message.textContent =
                "Menyiapkan kamera...";
        }

        try {

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {

                throw new Error(
                    "Browser tidak mendukung akses kamera."
                );

            }

            if (
                !window.ZXingBrowser ||
                !window.ZXingBrowser
                    .BrowserMultiFormatOneDReader
            ) {

                throw new Error(
                    "Library scanner barcode 1D tidak tersedia."
                );

            }

            this.detector =
                new ZXingBrowser
                    .BrowserMultiFormatOneDReader();

            if (
                "timeBetweenDecodingAttempts" in
                this.detector
            ) {

                this.detector
                    .timeBetweenDecodingAttempts = 50;

            }

            this.scanning = true;

            if (message) {
                message.textContent =
                    "Arahkan barcode ke dalam kotak...";
            }

            const constraints = {

                audio: false,

                video: {

                    width: {
                        ideal: 1280,
                        min: 960
                    },

                    height: {
                        ideal: 720,
                        min: 540
                    },

                    frameRate: {
                        ideal: 30,
                        max: 60
                    },

                    facingMode: {
                        ideal: "environment"
                    },

                    focusMode: {
                        ideal: "continuous"
                    }

                }

            };

            this.controls =
                await this.detector
                    .decodeFromConstraints(
                        constraints,
                        video,
                        async (
                            result,
                            error,
                            controls
                        ) => {

                            if (!this.scanning) {
                                return;
                            }

                            this.scanCount++;

                            if (error || !result) {
                                return;
                            }

                            const barcode =
                                String(
                                    result.getText
                                        ? result.getText()
                                        : ""
                                ).trim();

                            if (!barcode) {
                                return;
                            }

                            const now = Date.now();

                            if (
                                barcode === this.lastBarcode &&
                                now - this.lastDetectedTime < 1000
                            ) {
                                return;
                            }

                            this.lastBarcode = barcode;
                            this.lastDetectedTime = now;
                            this.scanning = false;

                            /* BUNYI BARCODE TERBACA */

                            this.playBeep("success");

                            if (controls) {

                                try {
                                    controls.stop();
                                } catch (stopError) {

                                    console.warn(
                                        "SALES ZXING STOP ERROR:",
                                        stopError
                                    );

                                }

                            }

                            this.controls = null;

                            /*
                             * Tutup kamera sebelum memproses
                             * barcode dan membuka Cart.
                             */

                            this.close();

                            await this.handleBarcode(
                                barcode
                            );

                        }
                    );

            if (video.srcObject) {
                this.stream = video.srcObject;
            }

            try {

                const tracks =
                    video.srcObject
                        ? video.srcObject.getVideoTracks()
                        : [];

                if (tracks.length > 0) {

                    const track = tracks[0];

                    this.stream = video.srcObject;

                    const capabilities =
                        track.getCapabilities
                            ? track.getCapabilities()
                            : {};

                    const advanced = {};

                    if (
                        Array.isArray(capabilities.focusMode) &&
                        capabilities.focusMode.includes("continuous")
                    ) {

                        advanced.focusMode = "continuous";

                    }

                    if (capabilities.zoom) {

                        const minZoom =
                            Number(capabilities.zoom.min);

                        const maxZoom =
                            Number(capabilities.zoom.max);

                        const targetZoom =
                            Math.min(
                                maxZoom,
                                Math.max(minZoom, 1.5)
                            );

                        if (
                            targetZoom >= minZoom &&
                            targetZoom <= maxZoom
                        ) {

                            advanced.zoom = targetZoom;

                        }

                    }

                    if (
                        Object.keys(advanced).length > 0 &&
                        track.applyConstraints
                    ) {

                        await track.applyConstraints({
                            advanced: [advanced]
                        });

                    }

                }

            } catch (cameraEnhanceError) {

                console.warn(
                    "SALES CAMERA OPTIMIZATION TIDAK TERSEDIA:",
                    cameraEnhanceError
                );

            }

           

        } catch (error) {

            console.error(
                "SALES BARCODE CAMERA ERROR:",
                error
            );

            this.scanning = false;

            if (message) {

                if (error.name === "NotAllowedError") {

                    message.textContent =
                        "Izin kamera ditolak. Izinkan akses kamera pada browser.";

                } else if (error.name === "NotFoundError") {

                    message.textContent =
                        "Kamera tidak ditemukan pada perangkat.";

                } else if (error.name === "NotReadableError") {

                    message.textContent =
                        "Kamera sedang digunakan aplikasi lain.";

                } else {

                    message.textContent =
                        error.message ||
                        "Kamera tidak dapat digunakan.";

                }

            }

            this.stopCamera();

        }

    },

    /* ======================================
       HANDLE BARCODE
    ====================================== */

    async handleBarcode(barcode) {

        this.scanning = false;

        if (!barcode) {
            return;
        }

      

        try {

            /*
             * focus:false mencegah input pencarian
             * memanggil focus() setelah scan kamera.
             */

            await Sales.handleBarcode(
                barcode,
                {
                    focus: false
                }
            );

        } catch (error) {

            console.error(
                "PROSES BARCODE CAMERA SALES ERROR:",
                error
            );

            return;

        }

        /*
         * Buka halaman Cart pada tampilan mobile.
         */

        const pos =
            document.querySelector(".pos");

        if (pos) {

            pos.classList.add(
                "mobile-cart-open"
            );

        }

        const cartPanel =
            document.getElementById("cartPanel");

        if (cartPanel) {
            cartPanel.scrollTop = 0;
        }

    },

    /* ======================================
       CLOSE
    ====================================== */

    close() {

        this.scanning = false;

        if (this.controls) {

            try {
                this.controls.stop();
            } catch (error) {

                console.warn(
                    "SALES ZXING STOP ERROR:",
                    error
                );

            }

            this.controls = null;

        }

        this.stopCamera();

        const modal =
            document.getElementById(
                "sales-barcode-scanner"
            );

        if (modal) {
            modal.hidden = true;
        }

        const video =
            document.getElementById(
                "sales-barcode-scanner-video"
            );

        if (video) {

            try {
                video.pause();
            } catch (error) {

                console.warn(
                    "SALES VIDEO PAUSE ERROR:",
                    error
                );

            }

            video.srcObject = null;

        }

        this.detector = null;
        this.lastBarcode = "";
        this.lastDetectedTime = 0;
        this.scanCount = 0;

    },

    /* ======================================
       STOP CAMERA
    ====================================== */

    stopCamera() {

        if (!this.stream) {
            return;
        }

        this.stream
            .getTracks()
            .forEach(track => {

                try {
                    track.stop();
                } catch (error) {

                    console.warn(
                        "SALES CAMERA TRACK STOP ERROR:",
                        error
                    );

                }

            });

        this.stream = null;

    }

};