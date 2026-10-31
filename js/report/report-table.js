// ======================================
// REPORT TABLE
// ======================================
Object.assign(Report, {

    renderTable() {

        const tbody =
            document.getElementById(
                "reportTableBody"
            );

        const count =
            document.getElementById(
                "reportCount"
            );

        if (!tbody) {
            return;
        }

        if (count) {
            count.textContent =
                `${this.filtered.length} transaksi`;
        }

        if (!this.filtered.length) {
            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        class="report-empty"
                    >
                        Tidak ada transaksi.
                    </td>
                </tr>
            `;
            return;
        }

        /* ==================================
           FUNGSI WAKTU UNTUK SORTING
        ================================== */
        const getSortTime =
            row => {

                const value =
                    row?.tanggal;

                if (
                    value instanceof Date &&
                    !isNaN(
                        value.getTime()
                    )
                ) {
                    return value.getTime();
                }

                if (
                    typeof value ===
                    "string"
                ) {

                    const text =
                        value.trim();

                    if (
                        /^\d{4}-\d{2}-\d{2}T/
                            .test(text)
                    ) {

                        const date =
                            new Date(
                                text
                            );

                        if (
                            !isNaN(
                                date.getTime()
                            )
                        ) {
                            return date.getTime();
                        }
                    }

                    if (
                        /^\d{4}-\d{2}-\d{2}$/
                            .test(text)
                    ) {

                        const date =
                            new Date(
                                text +
                                "T00:00:00"
                            );

                        if (
                            !isNaN(
                                date.getTime()
                            )
                        ) {
                            return date.getTime();
                        }
                    }

                    const localMatch =
                        text.match(
                            /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
                        );

                    if (localMatch) {

                        let year =
                            Number(
                                localMatch[3]
                            );

                        if (
                            year < 100
                        ) {
                            year += 2000;
                        }

                        const date =
                            new Date(
                                year,
                                Number(
                                    localMatch[2]
                                ) - 1,
                                Number(
                                    localMatch[1]
                                ),
                                Number(
                                    localMatch[4] ||
                                    0
                                ),
                                Number(
                                    localMatch[5] ||
                                    0
                                ),
                                Number(
                                    localMatch[6] ||
                                    0
                                )
                            );

                        if (
                            !isNaN(
                                date.getTime()
                            )
                        ) {
                            return date.getTime();
                        }
                    }
                }

                /* ==================================
                   FALLBACK DARI ID TRANSAKSI
                ================================== */
                const id =
                    String(
                        row?.id ||
                        ""
                    )
                    .trim();

                const idMatch =
                    id.match(
                        /^PJ-(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/
                    );

                if (idMatch) {

                    const year =
                        2000 +
                        Number(
                            idMatch[1]
                        );

                    const month =
                        Number(
                            idMatch[2]
                        ) - 1;

                    const day =
                        Number(
                            idMatch[3]
                        );

                    const hour =
                        Number(
                            idMatch[4]
                        );

                    const minute =
                        Number(
                            idMatch[5]
                        );

                    const second =
                        Number(
                            idMatch[6]
                        );

                    const date =
                        new Date(
                            year,
                            month,
                            day,
                            hour,
                            minute,
                            second
                        );

                    if (
                        !isNaN(
                            date.getTime()
                        )
                    ) {
                        return date.getTime();
                    }
                }

                return 0;
            };

        /* ==================================
           URUTKAN
           TERBARU → TERLAMA
        ================================== */
        const sortedData =
            [...this.filtered]
                .sort(
                    (a, b) => {

                        const timeA =
                            getSortTime(
                                a
                            );

                        const timeB =
                            getSortTime(
                                b
                            );

                        return (
                            timeB -
                            timeA
                        );
                    }
                );

        /* ==================================
           RENDER TABLE
        ================================== */
        tbody.innerHTML =
            sortedData
                .map(
                    (row, index) => {

                        const status =
                            String(
                                row.status ||
                                "-"
                            )
                            .trim()
                            .toUpperCase();

                        const statusClass =
                            status ===
                            "RETUR"
                                ? "retur"
                                : "";

                        return `
                            <tr
                                class="report-row"
                                data-id="${this.escapeHTML(
                                    row.id
                                )}"
                                tabindex="0"
                            >
                                <td>
                                    ${index + 1}
                                </td>

                                <td>
                                    <strong>
                                        ${this.escapeHTML(
                                            row.id
                                        )}
                                    </strong>
                                </td>

                                <td>
                                    ${this.date(
                                        row.tanggal
                                    )}
                                </td>

                                <td>
                                    ${this.escapeHTML(
                                        row.kasir ||
                                        "-"
                                    )}
                                </td>

                                <td>
                                    ${this.money(
                                        row.subtotal
                                    )}
                                </td>

                                <td>
                                    ${this.money(
                                        row.disc
                                    )}
                                </td>

                                <td>
                                    <strong>
                                        ${this.money(
                                            row.total
                                        )}
                                    </strong>
                                </td>

                                <td>
                                    <span
                                        class="report-status ${statusClass}"
                                    >
                                        ${this.escapeHTML(
                                            status
                                        )}
                                    </span>
                                </td>
                            </tr>
                        `;
                    }
                )
                .join("");

        /* ==================================
           ROW CLICK
        ================================== */
        tbody
            .querySelectorAll(
                ".report-row"
            )
            .forEach(
                row => {

                    row.addEventListener(
                        "click",
                        () => {

                            const id =
                                row.dataset.id;

                            if (!id) {
                                return;
                            }

                            this.detail(
                                id
                            );
                        }
                    );

                    /* ==================================
                       KEYBOARD
                    ================================== */
                    row.addEventListener(
                        "keydown",
                        event => {

                            if (
                                event.key ===
                                    "Enter" ||
                                event.key ===
                                    " "
                            ) {

                                event.preventDefault();

                                const id =
                                    row.dataset.id;

                                if (!id) {
                                    return;
                                }

                                this.detail(
                                    id
                                );
                            }
                        }
                    );
                }
            );
    }

});