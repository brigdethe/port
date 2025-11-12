document.addEventListener("DOMContentLoaded", async function() {


    function updateCenters() {
        document.querySelectorAll("._3802c04052af0bb5d03956299250789e-scssx").forEach(item => {
            const rect = item.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            item.style.setProperty("--center-x", `${centerX}px`);
            item.style.setProperty("--center-y", `${centerY}px`);
        });
    }
    updateCenters();
    window.addEventListener("resize", updateCenters);
    document.querySelectorAll("._3802c04052af0bb5d03956299250789e-scssx").forEach(item => {
        item.addEventListener("click", (event) => {
            const rect = item.getBoundingClientRect();
            const itemCenterX = rect.left + rect.width / 2;
            const itemCenterY = rect.top + rect.height / 2;
            item.style.transformOrigin = `${(itemCenterX / window.innerWidth) * 100}% ${(itemCenterY / window.innerHeight) * 100}%`;
            const modal = document.querySelector(".modal-standard");
            updateCenters();
            const computedStyle = getComputedStyle(event.target);
            const modalX = computedStyle.getPropertyValue("--center-x");
            const modalY = computedStyle.getPropertyValue("--center-y");
            modal.style.transformOrigin = `${modalX} ${modalY}`;
            const onTransitionEnd = (event) => {
                if (event.propertyName === "opacity" || event.propertyName === "transform") {
                    Fix_Pos();
                    modal.removeEventListener("transitionend", onTransitionEnd);
                }
            };
            modal.addEventListener("transitionend", onTransitionEnd);
        });
    });





    const stripe = Stripe("pk_live_51QtD3UIkHz534nqIyaLnTUljH1lzIwvobe4inz3zULsJwrLPRsrf754Gg2Rmf776NdXGDFikLTk2JagkSOvkgLPE00pLtJy8vi");
    async function strcheckout(user_id) {
        const selectedPackage = document.querySelector('#Get_Package').value;
        let productId;
        switch (selectedPackage) {
            case 'Standard':
                productId = 'prod_Rmon39P2ZtvFNp';
                break;
            case 'Basic':
                productId = 'prod_RmoluG8yFPqtzZ';
                break;
            case 'Premium':
                productId = 'prod_RmopHZaafcRfCp';
                break;
            default:
                alert("Please select a valid package.");
                return;
        }
        try {
            const response = await fetch('create-payment-intent.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `product_id=${productId}&user_id=${user_id}`
            });

            const session = await response.json();
            if (session.id) {
                // Update session_id in orders table where ID = user_id
                const updateSessionResponse = await fetch('update-session-id.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `user_id=${user_id}&session_unique_id=${session.session_unique_id}`,
                });
                const updateResult = await updateSessionResponse.json();
                if (updateResult.success) {
                    // Redirect to Stripe Checkout
                    await stripe.redirectToCheckout({ sessionId: session.id });
                } else {
                    alert("Error updating session ID in database.");
                }
            } else {
                alert("Error creating checkout session.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    }
    const reqForm = document.getElementById("reqform");
    const buyForm = document.getElementById("buyform");
    const deliveryElements = document.querySelectorAll(".delivery");
    reqForm.style.display = "none";
    buyForm.style.display = "none";
    Array.from(deliveryElements).forEach(function(item) {
        item.style.display = "none";
    });
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const session_id = params.get('id');
    if (session_id && (status === 'success' || status === 'cancel')) {
        fetch(`checkout.php?id=${session_id}`)
            .then(response => response.json())
            .then(data => {
                if ((status === 'success' || status === 'cancel') && data.order)
                {
                    const order = data.order;
                    Reset_Modal();
                    if (order.Package === 'Standard')
                    {
                        Load_Modal(1);
                    }
                    else if (order.Package === 'Premium')
                    {
                        Load_Modal(2);
                    }
                    else
                    {
                        Load_Modal(4);
                    }
                    scrollToTarget(document.querySelector("#packages"));
                    setTimeout(function() {Fix_Pos();}, 500);
                    document.getElementById('input-textbox_in_phra').value = order.Phrase; // Phrase field
                    document.getElementById('input-textbox_in_pro').value = order.Pronunciation; // Pronunciation field
                    document.getElementById('textfield-instr').value = order.Notes || ''; // Notes field (if any)
                    document.getElementById('input-textbox_in_mail').value = order.Email; // Email field
                    function resetCurrentClass(elements) {
                        elements.forEach(element => element.classList.remove('current'));
                    }
                    const toneValue = order.Tone;
                    const toneButtons = [
                        document.getElementById('specs-segment-sexy'),
                        document.getElementById('specs-segment-confident'),
                        document.getElementById('specs-segment-dark'),
                        document.getElementById('specs-segment-excited'),
                        document.getElementById('specs-segment-other')
                    ];
                    resetCurrentClass(toneButtons);
                    if (["Sexy", "Confident", "Dark", "Excited", "Other"].includes(toneValue)) {
                        document.getElementById(`specs-segment-${toneValue.toLowerCase()}`).classList.add('current');
                        document.getElementById("Get_Tone").value = toneValue;
                    }
                    const speedValue = order.Speed;
                    const speedButtons = [
                        document.getElementById('specs-segment-slow'),
                        document.getElementById('specs-segment-natural'),
                        document.getElementById('specs-segment-fast'),
                    ];
                    const bpmItem = document.getElementById('specs-segment-bpm');
                    const inputTextboxInBpm = document.getElementById('input-textbox_in_bpm');
                    resetCurrentClass([...speedButtons, bpmItem]);
                    if (["Slow", "Natural", "Fast"].includes(speedValue)) {
                        document.getElementById(`specs-segment-${speedValue.toLowerCase()}`).classList.add('current');
                        document.getElementById("Get_Speed").value = speedValue;
                    } else if (!isNaN(speedValue)) {
                        bpmItem.classList.add('current');
                        inputTextboxInBpm.value = speedValue;
                        document.getElementById("Get_Speed").value = speedValue;
                    }
                    const fxList = order.FX.split(',').map(fx => fx.trim());
                    const fxItems = document.querySelectorAll('.bubble-item');
                    const fxListElement = document.querySelector("#Get_FX");
                    fxItems.forEach(item => {
                        const fxItemText = item.textContent.trim();
                        if (fxList.includes(fxItemText)) {
                            item.classList.add('current_fx');
                        } else {
                            item.classList.remove('current_fx');
                        }
                    });
                    fxListElement.setAttribute("value", fxList.join(", "));
                    document.getElementById('t_sync').checked = (order.TS === 'On');
                    document.getElementById('Get_Sync').value = order.TS === 'On' ? 'On' : 'Off';
                    document.getElementById('a_norm').checked = (order.AN === 'On');
                    document.getElementById('Get_Normal').value = order.AN === 'On' ? 'On' : 'Off';
                    Fix_Pos();
                    if (status === 'success')
                    {
                        document.querySelectorAll('.section-modal').forEach(function(modal) {
                            modal.classList.add('disabled');
                            modal.classList.add('add_opacity');
                        });
                        document.querySelectorAll('.modalbutton').forEach(function(button) {
                            button.classList.add('disabled');
                        });
                        document.querySelectorAll('.mbtn_txt').forEach(function(txt) {
                            txt.classList.add('odica');
                        });
                        document.querySelectorAll('.mbtn-spinner').forEach(function(spinner) {
                            spinner.style.opacity = '1';
                        });
                        SendMsg('JePlatio', 1);
                    }

                }
                else
                {
                    alert('No order found or invalid data.');
                }
            })
            .catch(error => {
                console.error('Error fetching order data:', error);
            });
    }
    function Load_Modal(id) {
        Prepare_Modal(0);
        document.querySelector('.modal-standard').classList.toggle('modal-open');
        setTimeout(() => {document.querySelector('.modal-standard').classList.toggle("modal-sani");}, 10);
        mtoggleScroll(1);
        if (id === 1) {
            document.querySelector(".standard").classList.add("selectedpackage");
            document.querySelector('#Get_Package').setAttribute('value', 'Standard');
            Kad();
            document.querySelector('.otpack').innerHTML = 'Standard';
            showElements('#buyform, .delivery, .typography-modal-intro, .bubble_grid');
            hideElements('#reqform');
        } else if (id === 2) {
            document.querySelector(".deluxe").classList.add("selectedpackage");
            document.querySelector('#Get_Package').setAttribute('value', 'Premium');
            document.querySelector('.mjesec').innerHTML = 'Tomorrow';
            document.querySelector('.otpack').innerHTML = 'Premium';
            showElements('#buyform, .delivery, .typography-modal-intro, .bubble_grid');
            hideElements('#reqform');
        } else if (id === 3) {
            document.querySelectorAll('.mbtn_ld').forEach(btn => {
                btn.classList.remove('orderbutton');
                btn.classList.add('revbutton');
            });
            document.querySelector(".revision").classList.add("selectedpackage");
            document.querySelector('.mbtn-spinner').style.opacity = '0';
            document.querySelector('.mbtn_txt').innerHTML = 'Request';
            document.querySelector('.mbtn_txt').style.color = 'hsla(204, 87.6%, 52.7%, 1)';
            showElements('#reqform');
            hideElements('#buyform, .delivery');
        } else if (id === 4) {
            document.querySelector(".other").classList.add("selectedpackage");
            document.querySelector('#Get_Package').setAttribute('value', 'Basic');
            Kad();
            document.querySelector('.otpack').innerHTML = 'Basic';
            showElements('#buyform, .delivery');
            hideElements('#reqform, .typography-modal-intro, .bubble_grid');
        }
        if (id === 1 || id === 2 || id === 4) {
            document.querySelectorAll('.mbtn_ld').forEach(btn => {
                btn.classList.add('orderbutton');
                btn.classList.remove('revbutton');
            });
            document.querySelector('.mbtn-spinner').style.opacity = '0';
            document.querySelector('.mbtn_txt').innerHTML = 'Checkout';
            document.querySelector('.mbtn_txt').style.color = 'rgb(29, 156, 240)';
            Fix_Pos();
        }
    }
    function showElements(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.style.display = '';
        });
    }
    function hideElements(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.style.display = 'none';
        });
    }
    // Create reusable function for removing the modal
    function removeModal() {
        var modal = document.querySelector(".modal-standard");
        if (modal.classList.contains("modal-open"))
        {
                setTimeout(() => {
                modal.classList.remove("modal-open");
                Prepare_Modal(1);
                }, 300);
                document.querySelectorAll("._3802c04052af0bb5d03956299250789e-scssx").forEach(function(element) {
                element.classList.remove("selectedpackage");});
                modal.classList.remove("modal-sani");
                mtoggleScroll(0);
        }
    }
    function mtoggleScroll(state)
    {
        if (state === 1) {
            document.body.classList.add("scrhd");
        }
        else
        {
            setTimeout(() => {
                document.body.classList.remove("scrhd");
            }, 10);
        }
    }
    // Attach click event listener to all links
    document.querySelectorAll('.standard, .deluxe, .other, .revision').forEach(function(link) {
        link.addEventListener('click', goToPage);
    });
    // Attach click event listener to the modal close button
    document.querySelector(".modal-close").addEventListener("click", removeModal);
    // Attach keydown event listener to the window
    window.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            removeModal();
        }
    });
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function () {
            this.style.height = '3.125rem';
            this.style.height = `${this.scrollHeight}px`;
        });
    });
    const mjesecElement = document.querySelector(".mjesec");
    const monthNames = ["Jan ", "Feb ", "Mar ", "Apr ", "May ", "Jun ", "Jul ", "Aug ", "Sep ", "Oct ", "Nov ", "Dec "];
    function Kad() {
        const someDate = new Date();
        someDate.setDate(someDate.getDate() + 2);
        const monthName = monthNames[someDate.getMonth()];
        const date = someDate.getDate();
        mjesecElement.textContent = `${monthName}${date}`;
    }
    const leaveFeedback = document.querySelector("#leavefeedback");
    const reviewSlider = document.querySelector("#reviewslider");
    const getColorAndImageForRange = (range) => {
    const colorMap = [
            {
                range: [0, 20],
                color: "hsla(0, 0%, 100%, .13)",
                src: "/img/rate/1.webp",
            },
            {
                range: [20, 40],
                color: "hsla(15, 100%, 50%, .9)",
                src: "/img/rate/2.webp",
            },
            {
                range: [40, 60],
                color: "hsla(30, 100%, 50%, .9)",
                src: "/img/rate/3.webp",
            },
            {
                range: [60, 80],
                color: "hsla(60, 100%, 50%, .9)",
                src: "/img/rate/4.webp",
            },
            {
                range: [80, 100],
                color: "hsla(90, 100%, 50%, .9)",
                src: "/img/rate/5.webp",
            },
        ];
        return colorMap.find((item) => range >= item.range[0] && range <= item.range[1]) || {};
    };
    const updateSliderBackground = () => {
        const rangePercent = Math.round((reviewSlider.value / 4) * 100);
        const { color, src } = getColorAndImageForRange(rangePercent);
        reviewSlider.style.backgroundImage = `linear-gradient(to right, ${color} ${rangePercent-1}%, var(--clr-trns_ld_3) ${rangePercent-1}%)`;
        document.querySelector(':root').style.setProperty("--thumb-image-url", `url('${src}')`);
    };
    setTimeout(() => {
        leaveFeedback.classList.toggle("load");
    }, 500);
    reviewSlider.addEventListener("change", updateSliderBackground);
    reviewSlider.addEventListener("input", updateSliderBackground);
    const bubbleItems = document.querySelectorAll(".bubble-item");
    const fxList = document.querySelector("#Get_FX");
    bubbleItems.forEach(function(item) {
        item.addEventListener("click", function() {
            item.classList.toggle("current_fx");
            const fxNames = [
                "Auto Tune",
                "Reverb",
                "Delay",
                "Stereo Widening",
                "Stutter",
                "Reverse Reverb Riser",
                "Tape Stop (Pitch Drop)",
                "Low Pitch Overdub",
                "Telephone EQ Filter",
                "Radio style FX",
                "Robotic style FX",
                "I’m not sure. Do your thing!"
            ];
            const selectedFX = [];
            bubbleItems.forEach(function(bubble, index) {
                if (bubble.classList.contains("current_fx")) {
                    selectedFX.push(fxNames[index]); // Only push selected FX names
                }
            });
            fxList.setAttribute("value", selectedFX.join(", ")); // Join selected FX
        });
    });
// Get references to the relevant DOM elements
    const segmentnavItems = Array.from(document.querySelectorAll('.segmentnav-item'));
    const segmentnav2Items = Array.from(document.querySelectorAll('.segmentnav2-item'));
    const getTone = document.querySelector('#Get_Tone');
    const getSpeed = document.querySelector('#Get_Speed');
    const inputTextboxInBpm = document.querySelector('#input-textbox_in_bpm');
    const segmentnavOverflowContainerSpeed = document.querySelector('.segmentnav-overflow-container_speed');
// Define the toggle for tone values
    const toneToggle = {
        'specs-segment-sexy': 'Sexy',
        'specs-segment-confident': 'Confident',
        'specs-segment-dark': 'Dark',
        'specs-segment-excited': 'Excited',
        'specs-segment-other': 'Other'
    };
// Define the toggle for speed values
    const speedToggle = {
        'specs-segment-slow': {
            'value': 'Slow',
            'required': false
        },
        'specs-segment-natural': {
            'value': 'Natural',
            'required': false
        },
        'specs-segment-fast': {
            'value': 'Fast',
            'required': false
        },
        'specs-segment-bpm': {
            'value': 'BPM',
            'required': true
        }
    };
// Add click listeners to the segmentnav items
    segmentnavItems.forEach(function (item) {
        item.addEventListener('click', function () {
            // Remove the 'current' class from all segmentnav items and add it to the clicked item
            segmentnavItems.forEach(function (item) {
                item.classList.remove('current');
            });
            this.classList.add('current');

            // Set the tone value based on the toggle
            getTone.value = toneToggle[this.id];

            // Fix position
            Fix_Pos();
        });
    });
// Add click listeners to the segmentnav2 items
    segmentnav2Items.forEach(function (item) {
        item.addEventListener('click', function () {
            // Remove the 'current' class from all segmentnav2 items and add it to the clicked item
            segmentnav2Items.forEach(function (item) {
                item.classList.remove('current');
            });
            this.classList.add('current');

            // Set the speed value based on the toggle
            const speedToggleValue = speedToggle[this.id];
            getSpeed.value = speedToggleValue.value;

            // Update the 'required' attribute of the input textbox based on the toggle
            inputTextboxInBpm.required = speedToggleValue.required;

            // Remove the 'is-error' class from the segmentnav overflow container
            segmentnavOverflowContainerSpeed.classList.remove('is-error');

            // Set focus to the input textbox if the 'BPM' option is selected
            if (this.id === 'specs-segment-bpm') {
                inputTextboxInBpm.focus();
            }

            // Fix position
            Fix_Pos();
        });
    });
    const checkInputs = {
        "input-textbox_in_phra": ".form_phra",
        "input-textbox_in_pro": ".form_pro",
        "input-textbox_in_mail": ".form_mail",
        "input-textbox_in_bpm": ".segmentnav-overflow-container_speed",
        "input-textbox_in_order": ".form_order",
        "textfield-instr_2": ".form_instruction",
        "input-textbox_in_review": ".form_leavereview",
        "textfield-feed": ".form_feedback"
    };
    function Valid_Check(i_id) {
        const inputId = checkInputs[i_id];
        if (inputId) {
            const element = document.querySelector(inputId);
            element.classList.add("is-error", "is-error_ani");
            setTimeout(() => element.classList.remove("is-error_ani"), 512);
        }
    }
    document.querySelectorAll("#buyform, #reqform, #leavefeedback").forEach(function(form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
        });
    });
    document.querySelector('.orderbutton').addEventListener('click', function (e) {
        const form_b = document.querySelector('#buyform');
        let user_id = -1;
        if (!form_b.checkValidity()) {
            const invalids = form_b.querySelectorAll(':invalid');
            for (const input of invalids) {
                Valid_Check(input.id);
            }
            form_b.querySelector(':invalid').focus();
        }
        else
        {
            if (document.querySelector('#specs-segment-bpm').classList.contains('current')) {
                document.querySelector('#Get_Speed').setAttribute('value', document.querySelector('#input-textbox_in_bpm').value);
            }
            if (document.querySelector('#a_norm').checked) {
                document.querySelector('#Get_Normal').setAttribute('value', 'On');
            } else {
                document.querySelector('#Get_Normal').setAttribute('value', 'Off');
            }
            if (document.querySelector('#t_sync').checked) {
                document.querySelector('#Get_Sync').setAttribute('value', 'On');
            } else {
                document.querySelector('#Get_Sync').setAttribute('value', 'Off');
            }
            if (!document.querySelector('.section-modal').classList.contains('disabled'))
            {
                fetch('savetomysql.php', {
                    method: 'POST',
                    headers: { "cache-control": "no-cache" },
                    body: new FormData(document.querySelector('form#buyform')),
                    async: false // Set async to false
                })
                    .then(response => response.text())
                    .then(data => {
                        const order_ID = data;
                        document.querySelector('#GetOrderID').setAttribute('value', order_ID);
                        user_id = document.querySelector('#GetOrderID').getAttribute('value');
                        strcheckout(user_id);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                document.querySelectorAll('.section-modal').forEach(function(modal) {
                    modal.classList.add('disabled');
                    modal.classList.add('add_opacity');
                });
                document.querySelectorAll('.modalbutton').forEach(function(button) {
                    button.classList.add('disabled');
                });
                document.querySelectorAll('.mbtn_txt').forEach(function(txt) {
                    txt.classList.add('odica');
                });
                document.querySelectorAll('.mbtn-spinner').forEach(function(spinner) {
                    spinner.style.opacity = '1';
                });
            }
            else
            {
                return 1;
            }
        }
    });
    document.querySelectorAll(".revbutton").forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();

            const form_r = document.querySelector("#reqform");

            if (!form_r.checkValidity()) {
                const invalids = form_r.querySelectorAll(":invalid");
                for (const input of invalids) {
                    Valid_Check(input.id);
                }
                form_r.querySelector(":invalid").focus();
            } else {
                var order_id = -1;
                document.querySelector(".mbtn_txt").classList.add("odica");
                document.querySelector(".mbtn-spinner").style.opacity = "1";

                fetch("reqrev.php", {
                    method: "POST",
                    body: new FormData(form_r),
                })
                    .then(function (response) {
                        return response.text();
                    })
                    .then(function (data) {
                        if (data == "WrongID") {
                            document.querySelector(".form_order").classList.add("is-error", "is-error_ani");
                            setTimeout(function () {
                                document.querySelector(".form_order").classList.remove("is-error_ani");
                            }, 512);
                            document.getElementById("input-textbox_in_order").focus();
                            document.querySelector(".mbtn_txt").classList.remove("odica");
                            document.querySelector(".mbtn-spinner").style.opacity = "0";
                            return 1;
                        }
                        if (data == "VecTrazio") {
                            SendMsg("JeTrazio", 0);
                            document.querySelector(".section-modal").classList.add("disabled", "add_opacity");
                            document.querySelector(".modalbutton").classList.add("disabled", "is-error_ani");
                            setTimeout(function () {
                                document.querySelector(".modalbutton").classList.remove("is-error_ani");
                            }, 512);
                            return 1;
                        }
                        if (data == "Uspjeh") {
                            SendMsg("JeTrazio", 1);
                            document.querySelector(".section-modal").classList.add("disabled", "add_opacity");
                            document.querySelector(".modalbutton").classList.add("disabled");
                            order_id = document.getElementById("input-textbox_in_order").value;
                            return 1;
                        }
                    })
                    .catch(function (error) {
                        console.error("Error:", error);
                    });
            }
        });
    });
    document.querySelectorAll('.fbutton').forEach(function(button) {
        button.addEventListener('click', function(event) {
            const form = document.querySelector('#leavefeedback');
            if (!form.checkValidity()) {
                const invalids = form.querySelectorAll(':invalid');
                for (const input of invalids) {
                    Valid_Check(input.id);
                }
                form.querySelectorAll(':invalid').item(0).focus();
            } else {
                const data = new FormData(form);
                fetch('submitfeedback.php', {
                    method: 'POST',
                    body: data
                }).then(function(response) {
                    return response.text();
                }).then(function(data) {
                    if (data == "WrongID") {
                        const form = document.querySelector('.form_leavereview');
                        form.classList.add('is-error', 'is-error_ani');
                        setTimeout(function() {
                            form.classList.remove('is-error_ani');
                        }, 512);
                        document.getElementById("input-textbox_in_review").focus();
                        return 1;
                    } else if (data == "VecSubmited") {
                        SendMsg("JeFeed", 0);
                        const sectionFeedback = document.querySelector('.section-feedback');
                        sectionFeedback.classList.add('disabled', 'add_opacity');
                        const fbutton = document.querySelector('.fbutton');
                        fbutton.classList.add('disabled', 'is-error_ani');
                        setTimeout(function() {
                            fbutton.classList.remove('is-error_ani');
                        }, 512);
                        return 1;
                    } else if (data == "Uspjeh") {
                        SendMsg("JeFeed", 1);
                        const sectionFeedback = document.querySelector('.section-feedback');
                        sectionFeedback.classList.add('disabled', 'add_opacity');
                        const fbutton = document.querySelector('.fbutton');
                        fbutton.classList.add('disabled');
                        return 1;
                    }
                }).catch(function(error) {
                    console.error('Error:', error);
                });
            }
        });
    });
    function SendMsg(type, opc) {
        document.querySelectorAll('.mbtn-spinner').forEach(function (spinner) {
            spinner.style.opacity = '0';
        });
        if (type === 'JePlatio' || type === 'JeTrazio') {
            document.querySelectorAll('.section-modal').forEach(function (modal) {
                modal.classList.add('add_blur');
            });
            if (opc === 1) {
                document.querySelector('#ye_succ').classList.add('dodjimi');

                if (type === 'JePlatio') {
                    document.querySelectorAll('.otday, .otpack').forEach(function (element) {
                        element.style.display = 'none';
                    });
                }
                document.querySelector('.conf_msg_big').innerHTML = "You're all set.";
                document.querySelector('.conf_msg_smaller').innerHTML =
                    "We'll send confirmation and delivery updates to your email.";
                document.querySelector('#conf_msg').classList.add('dodji');
            } else {
                document.querySelector('#not_succ').classList.add('dodjimi');
                document.querySelectorAll('.delivery').forEach(function (element) {
                    element.classList.add('odica2');
                });
                document.querySelector('.conf_msg_big').innerHTML = 'Something went wrong.';

                if (type === 'JePlatio') {
                    document.querySelector('.conf_msg_smaller').innerHTML =
                        'There was a problem with your request. Please try again.';
                } else {
                    document.querySelector('.conf_msg_smaller').innerHTML =
                        "You've already requested a revision.";
                }

                document.querySelector('#conf_msg').classList.add('dodji');
            }
        }
        if (type === 'JeFeed') {
            document.querySelectorAll('.section-feedback').forEach(function (feedback) {
                feedback.classList.add('add_blur');
            });
            document.querySelector('.fbtn_text').classList.add('odica');

            if (opc === 1) {
                document.querySelector('#ye_succ_f').classList.add('dodjimi');
                document.querySelector('.conf_msg_big_f').innerHTML = 'Thanks for your review!';
                document.querySelector('.conf_msg_smaller_f').innerHTML = 'Your feedback has been submitted!';
                document.querySelector('#conf_msg_f').classList.add('dodji');

                var select = document.getElementById('rev_sort_options');
                select.value = 'most_recent';
                select.dispatchEvent(new Event('change'));
                document.querySelector('.revflex').scrollTop = 0;
            } else {
                document.querySelector('#not_succ_f').classList.add('dodjimi');
                document.querySelector('.conf_msg_big_f').innerHTML = 'Something went wrong.';
                document.querySelector('.conf_msg_smaller_f').innerHTML = "You've already submitted a review.";
                document.querySelector('#conf_msg_f').classList.add('dodji');
            }
        }
    }
    document.addEventListener("change", function(event) {
        if (event.target.matches("input, textarea")) {
            if (!event.target.checkValidity()) {
                Valid_Check(event.target.id);
            }
        }
    });
    document.addEventListener("input", function(event) {
        if (event.target.matches("input, textarea")) {
            let errorElem = event.target.closest(".is-error");
            if (errorElem) {
                errorElem.classList.remove("is-error");
            }
        }
    });
    window.addEventListener('resize', function(event) {
        Fix_Pos();
    });
    function setSelectionBackground(selectionBackgroundClass, navItemClass)
    {
        const selectionBackground = document.querySelector(selectionBackgroundClass);
        const currentNavItem = document.querySelector(`${navItemClass}.current`);
        if (!selectionBackground || !currentNavItem) return;
        const currentNavItemRect = currentNavItem.getBoundingClientRect();
        const parentRect = currentNavItem.parentElement.getBoundingClientRect();
        selectionBackground.style.width = `${currentNavItem.offsetWidth}px`;
        selectionBackground.style.left = `${currentNavItemRect.left - parentRect.left}px`;
    }
    function Fix_Pos() {
        setSelectionBackground(".segmentnav-selection-background", ".segmentnav-item");
        setSelectionBackground(".segmentnav2-selection-background", ".segmentnav2-item");
    }
    function Reset_Modal() {
        const buyForm = document.getElementById("buyform");
        const reqForm = document.getElementById("reqform");
        const bubbleItems = document.querySelectorAll(".bubble-item");
        const segmentNavItems = document.querySelectorAll(".segmentnav-item");
        const specsSegmentDark = document.getElementById("specs-segment-dark");
        const segmentNav2Items = document.querySelectorAll(".segmentnav2-item");
        const specsSegmentNatural = document.getElementById("specs-segment-natural");
        const inputTextboxInBpm = document.getElementById("input-textbox_in_bpm");
        const aNorm = document.getElementById("a_norm");
        const tSync = document.getElementById("t_sync");
        const getTone = document.getElementById("Get_Tone");
        const getSpeed = document.getElementById("Get_Speed");
        const getFx = document.getElementById("Get_FX");
        const getSync = document.getElementById("Get_Sync");
        const getNormal = document.getElementById("Get_Normal");
        const formTextboxes = document.querySelectorAll(".form-textbox, .segmentnav-overflow-container_speed, .segmentnav-overflow-container_tone");
        buyForm.reset();
        reqForm.reset();
        Array.from(bubbleItems).forEach(function(item) {
            item.classList.remove("current_fx");
        });
        Array.from(segmentNavItems).forEach(function(item) {
            item.classList.remove("current");
        });
        specsSegmentDark.classList.add("current");
        Array.from(segmentNav2Items).forEach(function(item) {
            item.classList.remove("current");
        });
        specsSegmentNatural.classList.add("current");
        inputTextboxInBpm.required = false;
        aNorm.checked = false;
        tSync.checked = false;
        getTone.value = "Dark";
        getSpeed.value = "Natural";
        getFx.value = `Do Your Thing`;
        getSync.value = "Off";
        getNormal.value = "Off";
        Array.from(formTextboxes).forEach(function(item) {
            item.classList.remove("is-error");
        });
        Fix_Pos();
        window.history.replaceState({}, window.title, "/");
    }
    function Prepare_Modal(sve) {
        const actsegnav = document.querySelectorAll('.segmentnav-selection-background, .segmentnav2-selection-background');
        const otdayElements = document.querySelectorAll('.otday, .otpack');
        const deliveryElements = document.querySelectorAll('.delivery');
        const sectionModalElements = document.querySelectorAll('.section-modal');
        const modalbuttonElements = document.querySelectorAll('.modalbutton');
        const mbtn_txtElements = document.querySelectorAll('.mbtn_txt');
        const ye_succElement = document.getElementById('ye_succ');
        const not_succElement = document.getElementById('not_succ');
        const conf_msgElement = document.getElementById('conf_msg');
        otdayElements.forEach(element => {
            element.style.display = '';
        });
        deliveryElements.forEach(element => {
            element.classList.remove('odica2');
        });
        sectionModalElements.forEach(element => {
            element.classList.remove('disabled');
            element.classList.remove('add_blur');
            element.classList.remove('add_opacity');
        });
        modalbuttonElements.forEach(element => {
            element.classList.remove('disabled');
        });
        mbtn_txtElements.forEach(element => {
            element.classList.remove('odica');
        });
        ye_succElement.classList.remove('dodjimi');
        not_succElement.classList.remove('dodjimi');
        conf_msgElement.classList.remove('dodji');
        if (sve == 1)
        {
            Reset_Modal();
            actsegnav.forEach(el => {el.style.transition = '';});
        }
        else
        {
            setTimeout(() => {
                actsegnav.forEach(el => {
                    el.style.transition = '.3s width cubic-bezier(0.4,0,0.2,1), .3s left cubic-bezier(0.4,0,0.2,1)';
                });
            }, 500);
        }
    }
    function goToPage(event) {
        event.preventDefault();
        const gridItems = document.querySelector('.grid-items');
        if (!gridItems.classList.contains('is-dragging')) {
            const hrefUrl = event.currentTarget.getAttribute('href');
            window.history.replaceState({}, window.title, hrefUrl);
            switch (hrefUrl) {
                case 'Basic':
                    Load_Modal(4);
                    break;
                case 'Standard':
                    Load_Modal(1);
                    break;
                case 'Premium':
                    Load_Modal(2);
                    break;
                case 'Revision':
                    Load_Modal(3);
                    break;
                default:
                    break;
            }
        }
    }
    const pathname = window.location.pathname.toLowerCase();
    if (pathname === "/basic") {
        setTimeout(() => {scrollToTarget(document.querySelector("#packages"));Load_Modal(4);setTimeout(function() {Fix_Pos();}, 500);}, 1800);
    } else if (pathname === "/standard") {
        setTimeout(() => {scrollToTarget(document.querySelector("#packages"));Load_Modal(1);setTimeout(function() {Fix_Pos();}, 500);}, 1800);
    } else if (pathname === "/premium") {
        setTimeout(() => {scrollToTarget(document.querySelector("#packages"));Load_Modal(2);setTimeout(function() {Fix_Pos();}, 500);}, 1800);
    } else if (pathname === "/revision") {
        setTimeout(() => {scrollToTarget(document.querySelector("#packages"));Load_Modal(3);setTimeout(function() {Fix_Pos();}, 500);}, 1800);
    } else {
        window.history.replaceState({}, window.title, "/");
    }
});