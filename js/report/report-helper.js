// ======================================
// REPORT HELPER
// ======================================

Object.assign(Report, {

    showLoading() {

        const tbody =
            document.getElementById(
                "reportTableBody"
            );

        if (!tbody) return;


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="report-empty"
                >

                    Memuat data...

                </td>

            </tr>

        `;

    },


    showError(message) {

        const tbody =
            document.getElementById(
                "reportTableBody"
            );

        if (!tbody) return;


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="report-empty"
                >

                    Gagal mengambil data report.

                    <br>

                    <small>
                        ${message}
                    </small>

                </td>

            </tr>

        `;

    },


    setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent =
                value;

        }

    },


    money(value) {

        return new Intl.NumberFormat(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0
            }
        ).format(
            Number(value) || 0
        );

    },


    date(value) {

    if (!value) return "-";


    /* ==================================
       GOOGLE SHEETS / SERVER DATE
       FORMAT:
       dd/MM/yyyy HH:mm
    ================================== */

    if (typeof value === "string") {

        const match =
            value.match(
                /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/
            );


        if (match) {

            const day =
                Number(match[1]);

            const month =
                Number(match[2]) - 1;

            const year =
                Number(match[3]);

            const hour =
                Number(match[4] || 0);

            const minute =
                Number(match[5] || 0);

            const second =
                Number(match[6] || 0);


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

                return new Intl.DateTimeFormat(
                    "id-ID",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                ).format(date);

            }

        }

    }


    /* ==================================
       FALLBACK
    ================================== */

    const date =
        new Date(value);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);

}    

});