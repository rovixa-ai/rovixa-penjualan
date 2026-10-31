/*======================================
  NOTIFICATION
======================================*/

const Notification = {

    container: null,


    /*==================================
      INITIALIZE
    ==================================*/

    init() {

        this.createContainer();

    },


    /*==================================
      CREATE CONTAINER
    ==================================*/

    createContainer() {

        if (
            this.container &&
            document.body.contains(
                this.container
            )
        ) {

            return;

        }


        this.container =
            document.createElement(
                "div"
            );


        this.container.className =
            "notification-container";


        document.body.appendChild(
            this.container
        );

    },


    /*==================================
      SHOW
    ==================================*/

    show(
        message,
        type = "info",
        duration = 3000
    ) {

        this.createContainer();


        const notification =
            document.createElement(
                "div"
            );


        notification.className =
            "notification notification-" +
            type;


        /*==================================
          ICON
        ==================================*/

        const icon =
            this.getIcon(
                type
            );


        /*==================================
          HTML
        ==================================*/

        notification.innerHTML = `

            <div class="notification-icon">

                ${icon}

            </div>


            <div class="notification-message">

                ${this.escapeHTML(
                    message
                )}

            </div>


            <button
                type="button"
                class="notification-close"
                aria-label="Tutup"
            >

                ×

            </button>

        `;


        this.container.appendChild(
            notification
        );


        /*==================================
          CLOSE BUTTON
        ==================================*/

        const closeButton =
            notification.querySelector(
                ".notification-close"
            );


        closeButton.addEventListener(
            "click",
            () => {

                this.remove(
                    notification
                );

            }
        );


        /*==================================
          AUTO CLOSE
        ==================================*/

        if (
            duration > 0
        ) {

            notification._timer =
                setTimeout(
                    () => {

                        this.remove(
                            notification
                        );

                    },
                    duration
                );

        }


        return notification;

    },


    /*==================================
      REMOVE
    ==================================*/

    remove(
        notification
    ) {

        if (
            !notification
        ) {

            return;

        }


        if (
            notification._timer
        ) {

            clearTimeout(
                notification._timer
            );

        }


        notification.style.opacity =
            "0";

        notification.style.transform =
            "translateX(30px)";


        notification.style.transition =
            "opacity 0.2s ease, " +
            "transform 0.2s ease";


        setTimeout(
            () => {

                if (
                    notification.parentNode
                ) {

                    notification.remove();

                }

            },
            200
        );

    },


    /*==================================
      ICON
    ==================================*/

    getIcon(
        type
    ) {

        switch (
            String(type)
                .toLowerCase()
        ) {

            case "success":

                return "✓";


            case "error":

                return "✕";


            case "warning":

                return "⚠";


            case "info":

            default:

                return "i";

        }

    },


    /*==================================
      SUCCESS
    ==================================*/

    success(
        message,
        duration = 3000
    ) {

        return this.show(
            message,
            "success",
            duration
        );

    },


    /*==================================
      ERROR
    ==================================*/

    error(
        message,
        duration = 4000
    ) {

        return this.show(
            message,
            "error",
            duration
        );

    },


    /*==================================
      WARNING
    ==================================*/

    warning(
        message,
        duration = 4000
    ) {

        return this.show(
            message,
            "warning",
            duration
        );

    },


    /*==================================
      INFO
    ==================================*/

    info(
        message,
        duration = 3000
    ) {

        return this.show(
            message,
            "info",
            duration
        );

    },


    /*==================================
      ESCAPE HTML
    ==================================*/

    escapeHTML(
        value
    ) {

        return String(
            value ?? ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

    }

};
