var queryConfidences = {}

async function run(flowId) {
    window.queryConfidences = {};
    const flowVersion = await makeGenesysRequest(`/api/v2/flows/${flowId}/latestconfiguration`);
    console.log(flowVersion)

    const copiedFlow = await createFlow(flowVersion);

    const currentDate = new Date().toISOString().split("T")[0] + "T23:59:59Z";
    const date10DaysAgo = new Date(new Date().valueOf() - (86400000 * 10)).toISOString().split("T")[0] + "T00:00:00Z";

    const botTurns = await getPagedGenesysItems(`/api/v2/analytics/botflows/${flowId}/reportingturns?interval=${date10DaysAgo}/${currentDate}`);
    for (let turn of botTurns) {
        if (turn?.askAction?.actionType === "WaitForInputAction" || turn?.askAction?.actionType === "DigitalMenuAction") {
            if (turn?.intent?.name && turn?.intent?.confidence) {
                queryConfidences[turn.userInput] = { intent: turn.intent.name, confidence: turn.intent.confidence };
            }
        }
    }

    const results = {
        "up": [],
        "down": [],
        "noChange": []
    }
    for (let query in window.queryConfidences) {
        testFlow(copiedFlow.mainifest.nluDomain[0].id, copiedFlow.mainifest.nluDomain[0].version, query)
    }
    return;
}

async function deleteFlow(flowId) {
    return makeGenesysRequest(`/api/v2/flows?id=${flowId}`, "DELETE");
}

async function testFlow(flowId, versionId, query) {
    const body = {"input":{"text":query}}
    return makeGenesysRequest(`/api/v2/languageunderstanding/domains/b53ad8f6-285e-4cf4-9c50-70df0abccc93/versions/62ba4963-755b-47ae-80ac-eae59ba5f981/detect`)
}

function showLoginPage() {
    const urls = ["usw2.pure.cloud", "mypurecloud.com", "use2.us-gov-pure.cloud", "cac1.pure.cloud", "mypurecloud.ie", "euw2.pure.cloud", "mypurecloud.de", "aps1.pure.cloud", "mypurecloud.jp", "apne2.pure.cloud", "mypurecloud.com.au", "sae1.pure.cloud"]
    const inputsWrapper = newElement('div', { id: "inputs" });
    const clientIdLabel = newElement('label', { innerText: "Client ID: " });
    const clientInput = newElement('input', { name: "clientId" });
    addElement(clientInput, clientIdLabel);
    const environmentLabel = newElement('label', { innerText: "Environment: " });
    const environmentSelect = newElement('select', { name: "environment" });
    for (let url of urls) {
        const option = newElement('option', { innerText: url });
        addElement(option, environmentSelect);
    }
    addElement(environmentSelect, environmentLabel);
    const loginButton = newElement("button", { id: "login", innerText: "Log In" });
    registerElement(loginButton, "click", login);
    const parent = eById('page');
    clearElement(parent);
    addElements([clientIdLabel, environmentLabel, loginButton], inputsWrapper);
    addElement(inputsWrapper, parent);
}

async function populateBotSelect(botSelect) {
    const digitalBots = await getAllGenesysItems(`/api/v2/flows?sortBy=name&sortOrder=asc&type=digitalbot`, 50, "entities");
    for (const flow of digitalBots) {
        const botOption = newElement("option", { innerText: flow.name, value: flow.id });
        addElement(botOption, botSelect);
    }
}

function showMainMenu() {
    const page = eById('page');
    clearElement(page);
    const inputs = newElement("div", { id: "inputs" });
    const botFlowLabel = newElement('label', { innerText: "Bot Flow: " })
    const botSelect = newElement('select', { id: "botFlowId" });
    showLoading(populateBotSelect, [botSelect]);
    addElement(botSelect, botFlowLabel);
    const startButton = newElement('button', { innerText: "Start" });
    registerElement(startButton, "click", () => { showLoading(run, [botSelect.value]) });
    const logoutButton = newElement('button', { innerText: "Logout" });
    registerElement(logoutButton, "click", logout);
    const results = newElement('div', { id: "results" })
    addElement(botFlowLabel, inputs);
    addElements([inputs, startButton, logoutButton, results], page);
    getOrgDetails().then(function (result) {
        if (result.status !== 200) {
            log(result.message, "error");
            logout();
            return;
        }
        window.orgName = result.name;
        window.orgId = result.id;
        eById("header").innerText = `Current Org Name: ${result.name} (${result.thirdPartyOrgName})\nCurrent Org ID: ${result.id}`
    }).catch(function (error) { log(error, "error"); logout(); });
}

async function getOrgDetails() {
    return makeGenesysRequest(`/api/v2/organizations/me`);
}

async function createFlow(originalFlow) {
    const newFlowName = `${originalFlow.name} Copy - NLU Optimization`
    const createFlowBody = { "type": "digitalbot", "name": newFlowName, "description": `Flow with a copy of the intents from ${originalFlow.name} used for automated NLU testing and optimization`, "division": { "id": "235a0cf9-7d53-43e1-928e-520327a7e38f" }, "worktypeId": null }
    const newFlow = await makeGenesysRequest(`/api/v2/flows?language=en-us`, "POST", createFlowBody);

    const disconnectAction = createDisconnectAction()
    const initialSequenceId = crypto.randomUUID();
    const flowVersionBody = {
        "nextTrackingNumber": 12,
        "defaultLanguage": "en-US",
        "initialSequence": initialSequenceId,
        "name": newFlowName,
        "uiMetaData": {
            "bridgeServerActions": [],
            "screenPops": [],
            "flowViewFilterOptions": {
                "outputMode": "text",
                "language": "en-US",
                "enabled": false
            }
        },
        "supportedLanguages": [
            "en-US"
        ],
        "manifest": {
            "nluDomain": [
                {
                    "name": "Nlu4BotFlow_526eaeb6-0249-4f2d-82e4-3b41d54d4c77",
                    "id": "c5a9e724-9bcb-441b-b618-87d8e4670d69",
                    "context": [
                        {
                            "id": "botFlowSettings"
                        }
                    ]
                }
            ],
            "language": [
                {
                    "id": "en-US"
                }
            ],
            "userPrompt": [],
            "systemPrompt": []
        },
        "type": "digitalbot",
        "botFlowSettings": {
            "engineVersion": "3.0",
            "nluDomainId": "c5a9e724-9bcb-441b-b618-87d8e4670d69",
            "virtualAgentEnabled": false
        },
        "userInputSettings": {
            "enableBargeIn": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "true",
                        "type": "bln"
                    }
                },
                "text": "true",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "enableAutomaticQuickReplies": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "true",
                        "type": "bln"
                    }
                },
                "text": "true",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "noMatchesMax": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "3",
                        "type": "int"
                    }
                },
                "text": "3",
                "type": "int",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "noInputsMax": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "3",
                        "type": "int"
                    }
                },
                "text": "3",
                "type": "int",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "endOfSessionMessage": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(\"I have not heard from you in a while, so I am closing this chat, please come back if you need my help again. Thank you.\"))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "lit": {
                                                "pos": 38,
                                                "text": "I have not heard from you in a while, so I am closing this chat, please come back if you need my help again. Thank you.",
                                                "type": "str"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(\"I have not heard from you in a while, so I am closing this chat, please come back if you need my help again. Thank you.\"))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "a46ee3e0-ebb4-4bef-afc2-48f6cb86166b",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "6aadad9d-94ca-4f32-be22-1c35c81f4496",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"I have not heard from you in a while, so I am closing this chat, please come back if you need my help again. Thank you.\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "I have not heard from you in a while, so I am closing this chat, please come back if you need my help again. Thank you.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"I have not heard from you in a while, so I am closing this chat, please come back if you need my help again. Thank you.\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "I have not heard from you in a while, so I am closing this chat, please come back if you need my help again. Thank you."
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2
            },
            "noInputsTimeout": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "P0D0H1M0S0F",
                        "type": "dur"
                    }
                },
                "text": "P0D0H1M0S0F",
                "type": "dur",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "speechToTextSpeechDetectionSensitivity": {
                "config": {
                    "emp": {
                        "pos": 1,
                        "text": "",
                        "type": "dec"
                    }
                },
                "text": "",
                "type": "dec",
                "uiMetaData": {
                    "mode": 3
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "speechToTextMaxSpeechTimeout": {
                "config": {
                    "emp": {
                        "pos": 1,
                        "text": "",
                        "type": "dur"
                    }
                },
                "text": "",
                "type": "dur",
                "uiMetaData": {
                    "mode": 3
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "enableIntentClassificationHinting": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "",
                        "type": "bln"
                    }
                },
                "text": "",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "interDigitTimeout": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "P0D0H0M3S0F",
                        "type": "dur"
                    }
                },
                "text": "P0D0H0M3S0F",
                "type": "dur",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "dtmfTerminatingCharacter": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "#",
                        "type": "str"
                    }
                },
                "text": "#",
                "type": "str",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "confirmationRejectionsMax": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "3",
                        "type": "int"
                    }
                },
                "text": "3",
                "type": "int",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "collectionLowConfidenceThreshold": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "20",
                        "type": "int"
                    }
                },
                "text": "20",
                "type": "int",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "collectionHighConfidenceThreshold": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "70",
                        "type": "int"
                    }
                },
                "text": "70",
                "type": "int",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "confirmationLowConfidenceThreshold": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "40",
                        "type": "int"
                    }
                },
                "text": "40",
                "type": "int",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "noMatchApologies": [
                {
                    "config": {
                        "MakeCommunication": {
                            "pos": 1,
                            "text": "MakeCommunication(ToCommunication(\"Sorry.\"))",
                            "operands": [
                                {
                                    "ToCommunication": {
                                        "pos": 22,
                                        "operands": [
                                            {
                                                "lit": {
                                                    "pos": 38,
                                                    "text": "Sorry.",
                                                    "type": "str"
                                                }
                                            }
                                        ],
                                        "type": "com"
                                    }
                                }
                            ],
                            "type": "com"
                        }
                    },
                    "text": "MakeCommunication(\n  ToCommunication(\"Sorry.\"))",
                    "type": "com",
                    "uiMetaData": {
                        "mode": 4,
                        "builder": {
                            "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                            "id": "ee9b54e0-bb63-45bf-85b1-4667f3e777ea",
                            "version": 1,
                            "builderParts": [
                                {
                                    "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                    "id": "0687d855-eeb6-4bcf-b70e-bdf905b3aadf",
                                    "outOfService": false,
                                    "version": 1,
                                    "builderPartExpressions": [
                                        {
                                            "config": {
                                                "ToCommunication": {
                                                    "pos": 1,
                                                    "text": "ToCommunication(\"Sorry.\")",
                                                    "operands": [
                                                        {
                                                            "lit": {
                                                                "pos": 1,
                                                                "text": "Sorry.",
                                                                "type": "str"
                                                            }
                                                        }
                                                    ],
                                                    "type": "com"
                                                }
                                            },
                                            "text": "\"Sorry.\"",
                                            "type": "com",
                                            "uiMetaData": {
                                                "mode": 0,
                                                "markdownText": "Sorry."
                                            },
                                            "metaData": {},
                                            "version": 2
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    "metaData": {},
                    "version": 2
                }
            ],
            "noInputsApologies": [
                {
                    "config": {
                        "MakeCommunication": {
                            "pos": 1,
                            "text": "MakeCommunication(ToCommunication(\"Sorry, I didn't receive any input from you.\"))",
                            "operands": [
                                {
                                    "ToCommunication": {
                                        "pos": 22,
                                        "operands": [
                                            {
                                                "lit": {
                                                    "pos": 38,
                                                    "text": "Sorry, I didn't receive any input from you.",
                                                    "type": "str"
                                                }
                                            }
                                        ],
                                        "type": "com"
                                    }
                                }
                            ],
                            "type": "com"
                        }
                    },
                    "text": "MakeCommunication(\n  ToCommunication(\"Sorry, I didn't receive any input from you.\"))",
                    "type": "com",
                    "uiMetaData": {
                        "mode": 4,
                        "builder": {
                            "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                            "id": "b7f42b94-23c8-4aac-adeb-a4a1997ea4a8",
                            "version": 1,
                            "builderParts": [
                                {
                                    "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                    "id": "228f9c4f-cc1a-4e8b-90f1-ab5a61ffc065",
                                    "outOfService": false,
                                    "version": 1,
                                    "builderPartExpressions": [
                                        {
                                            "config": {
                                                "ToCommunication": {
                                                    "pos": 1,
                                                    "text": "ToCommunication(\"Sorry, I didn't receive any input from you.\")",
                                                    "operands": [
                                                        {
                                                            "lit": {
                                                                "pos": 1,
                                                                "text": "Sorry, I didn't receive any input from you.",
                                                                "type": "str"
                                                            }
                                                        }
                                                    ],
                                                    "type": "com"
                                                }
                                            },
                                            "text": "\"Sorry, I didn't receive any input from you.\"",
                                            "type": "com",
                                            "uiMetaData": {
                                                "mode": 0,
                                                "markdownText": "Sorry, I didn't receive any input from you."
                                            },
                                            "metaData": {},
                                            "version": 2
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    "metaData": {},
                    "version": 2
                }
            ],
            "noToConfirmationApologies": [
                {
                    "config": {
                        "MakeCommunication": {
                            "pos": 1,
                            "text": "MakeCommunication(ToCommunication(\"My mistake.\"))",
                            "operands": [
                                {
                                    "ToCommunication": {
                                        "pos": 22,
                                        "operands": [
                                            {
                                                "lit": {
                                                    "pos": 38,
                                                    "text": "My mistake.",
                                                    "type": "str"
                                                }
                                            }
                                        ],
                                        "type": "com"
                                    }
                                }
                            ],
                            "type": "com"
                        }
                    },
                    "text": "MakeCommunication(\n  ToCommunication(\"My mistake.\"))",
                    "type": "com",
                    "uiMetaData": {
                        "mode": 4,
                        "builder": {
                            "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                            "id": "7497b2a2-b56d-4278-b220-be0319635f8b",
                            "version": 1,
                            "builderParts": [
                                {
                                    "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                    "id": "fbd30d9f-cc2a-4f3d-b578-1357f4c13872",
                                    "outOfService": false,
                                    "version": 1,
                                    "builderPartExpressions": [
                                        {
                                            "config": {
                                                "ToCommunication": {
                                                    "pos": 1,
                                                    "text": "ToCommunication(\"My mistake.\")",
                                                    "operands": [
                                                        {
                                                            "lit": {
                                                                "pos": 1,
                                                                "text": "My mistake.",
                                                                "type": "str"
                                                            }
                                                        }
                                                    ],
                                                    "type": "com"
                                                }
                                            },
                                            "text": "\"My mistake.\"",
                                            "type": "com",
                                            "uiMetaData": {
                                                "mode": 0,
                                                "markdownText": "My mistake."
                                            },
                                            "metaData": {},
                                            "version": 2
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    "metaData": {},
                    "version": 2
                }
            ],
            "confirmationNoMatchApologies": [
                {
                    "config": {
                        "MakeCommunication": {
                            "pos": 1,
                            "text": "MakeCommunication(ToCommunication(\"Sorry, please input \\\"Yes\\\" or \\\"No\\\".\"))",
                            "operands": [
                                {
                                    "ToCommunication": {
                                        "pos": 22,
                                        "operands": [
                                            {
                                                "lit": {
                                                    "pos": 38,
                                                    "text": "Sorry, please input \"Yes\" or \"No\".",
                                                    "type": "str"
                                                }
                                            }
                                        ],
                                        "type": "com"
                                    }
                                }
                            ],
                            "type": "com"
                        }
                    },
                    "text": "MakeCommunication(\n  ToCommunication(\"Sorry, please input \\\"Yes\\\" or \\\"No\\\".\"))",
                    "type": "com",
                    "uiMetaData": {
                        "mode": 4,
                        "builder": {
                            "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                            "id": "ffb521a6-b48c-4215-b5e9-4bf76838354a",
                            "version": 1,
                            "builderParts": [
                                {
                                    "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                    "id": "621fbd60-3d09-4971-9643-5d5509110f5c",
                                    "outOfService": false,
                                    "version": 1,
                                    "builderPartExpressions": [
                                        {
                                            "config": {
                                                "ToCommunication": {
                                                    "pos": 1,
                                                    "text": "ToCommunication(\"Sorry, please input \\\"Yes\\\" or \\\"No\\\".\")",
                                                    "operands": [
                                                        {
                                                            "lit": {
                                                                "pos": 1,
                                                                "text": "Sorry, please input \"Yes\" or \"No\".",
                                                                "type": "str"
                                                            }
                                                        }
                                                    ],
                                                    "type": "com"
                                                }
                                            },
                                            "text": "\"Sorry, please input \\\"Yes\\\" or \\\"No\\\".\"",
                                            "type": "com",
                                            "uiMetaData": {
                                                "mode": 0,
                                                "markdownText": "Sorry, please input \"Yes\" or \"No\"."
                                            },
                                            "metaData": {},
                                            "version": 2
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    "metaData": {},
                    "version": 2
                }
            ],
            "confirmationNoInputApologies": [
                {
                    "config": {
                        "MakeCommunication": {
                            "pos": 1,
                            "text": "MakeCommunication(ToCommunication(\"Sorry, I didn't receive any input from you.  Please input \\\"Yes\\\" or \\\"No\\\".\"))",
                            "operands": [
                                {
                                    "ToCommunication": {
                                        "pos": 22,
                                        "operands": [
                                            {
                                                "lit": {
                                                    "pos": 38,
                                                    "text": "Sorry, I didn't receive any input from you.  Please input \"Yes\" or \"No\".",
                                                    "type": "str"
                                                }
                                            }
                                        ],
                                        "type": "com"
                                    }
                                }
                            ],
                            "type": "com"
                        }
                    },
                    "text": "MakeCommunication(\n  ToCommunication(\"Sorry, I didn't receive any input from you.  Please input \\\"Yes\\\" or \\\"No\\\".\"))",
                    "type": "com",
                    "uiMetaData": {
                        "mode": 4,
                        "builder": {
                            "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                            "id": "6847426e-528b-41d0-a31b-d7c14208770a",
                            "version": 1,
                            "builderParts": [
                                {
                                    "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                    "id": "d6d652a4-67b8-40a2-bad3-de74fde38865",
                                    "outOfService": false,
                                    "version": 1,
                                    "builderPartExpressions": [
                                        {
                                            "config": {
                                                "ToCommunication": {
                                                    "pos": 1,
                                                    "text": "ToCommunication(\"Sorry, I didn't receive any input from you.  Please input \\\"Yes\\\" or \\\"No\\\".\")",
                                                    "operands": [
                                                        {
                                                            "lit": {
                                                                "pos": 1,
                                                                "text": "Sorry, I didn't receive any input from you.  Please input \"Yes\" or \"No\".",
                                                                "type": "str"
                                                            }
                                                        }
                                                    ],
                                                    "type": "com"
                                                }
                                            },
                                            "text": "\"Sorry, I didn't receive any input from you.  Please input \\\"Yes\\\" or \\\"No\\\".\"",
                                            "type": "com",
                                            "uiMetaData": {
                                                "mode": 0,
                                                "markdownText": "Sorry, I didn't receive any input from you.  Please input \"Yes\" or \"No\"."
                                            },
                                            "metaData": {},
                                            "version": 2
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    "metaData": {},
                    "version": 2
                }
            ]
        },
        "errorHandling": {
            "recognitionHandlingType": "Exit",
            "agentEscalationConfirmation": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"You want to speak to an advisor. Is that correct?\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "You want to speak to an advisor. Is that correct?",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"You want to speak to an advisor. Is that correct?\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "8d59f027-2560-4a26-b157-82db4746d088",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "7ebc8637-9a5b-4714-b00d-078c20613830",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"You want to speak to an advisor. Is that correct?\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "You want to speak to an advisor. Is that correct?",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"You want to speak to an advisor. Is that correct?\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "You want to speak to an advisor. Is that correct?"
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2
            },
            "agentEscalationHandover": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"One moment, please, and I will put you through to someone.\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "One moment, please, and I will put you through to someone.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"One moment, please, and I will put you through to someone.\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "f35d07ce-8dbb-4c00-ba60-bf83d1f54e78",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "8d194f23-d752-40df-ba60-7c893602ae76",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"One moment, please, and I will put you through to someone.\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "One moment, please, and I will put you through to someone.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"One moment, please, and I will put you through to someone.\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "One moment, please, and I will put you through to someone."
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2
            },
            "enableAgentEscalation": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "true",
                        "type": "bln"
                    }
                },
                "text": "true",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "errorEventHandover": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"Sorry, an error occurred. One moment, please, while I put you through to someone who can help.\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "Sorry, an error occurred. One moment, please, while I put you through to someone who can help.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"Sorry, an error occurred. One moment, please, while I put you through to someone who can help.\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "d660a50d-6248-4b47-99e3-07ef920a0c46",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "9844fcb7-10ea-4101-9bba-35dc779f23db",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"Sorry, an error occurred. One moment, please, while I put you through to someone who can help.\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "Sorry, an error occurred. One moment, please, while I put you through to someone who can help.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"Sorry, an error occurred. One moment, please, while I put you through to someone who can help.\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "Sorry, an error occurred. One moment, please, while I put you through to someone who can help."
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2
            },
            "recognitionEventHandover": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"Sorry, I'm having trouble understanding you. One moment, please, while I put you through to someone who can help.\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "Sorry, I'm having trouble understanding you. One moment, please, while I put you through to someone who can help.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"Sorry, I'm having trouble understanding you. One moment, please, while I put you through to someone who can help.\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "f9030cf1-b026-4e02-b8a2-d4c9aefa298b",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "51aa7092-9927-4976-b9a5-3c34fbb2b776",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"Sorry, I'm having trouble understanding you. One moment, please, while I put you through to someone who can help.\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "Sorry, I'm having trouble understanding you. One moment, please, while I put you through to someone who can help.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"Sorry, I'm having trouble understanding you. One moment, please, while I put you through to someone who can help.\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "Sorry, I'm having trouble understanding you. One moment, please, while I put you through to someone who can help."
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2
            },
            "agentEscalationHandlingType": "Exit",
            "handlingType": "Exit"
        },
        "nluMetaData": {
            "intents": {},
            "slots": {},
            "rawNlu": null,
            "intentHealthInfo": null,
            "rawNluCompressionFormat": "none",
            "nluGeneratedInputInfo": {},
            "mappings": {
                "intentsToReusableTasks": {},
                "slotsToGrammars": {},
                "slotToSlotVariables": {},
                "slotToReferencingIntents": {},
                "slotToEntityTypes": {},
                "dynamicSlotTypes": {}
            }
        },
        "knowledgeSettings": {
            "knowledge": null,
            "knowledgeConfirmation": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"Did this answer your question?\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "Did this answer your question?",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"Did this answer your question?\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "9e933f5b-fd53-425a-8a3f-2b0d90eb70a3",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "09a0e689-141f-4a00-a8b2-c28d66d2c18c",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"Did this answer your question?\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "Did this answer your question?",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"Did this answer your question?\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "Did this answer your question?"
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeInitialResponseFollowup": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"I hope I answered your question.  You can ask anything else you might want to know.\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "I hope I answered your question.  You can ask anything else you might want to know.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"I hope I answered your question.  You can ask anything else you might want to know.\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "2f39d2dc-4496-4a20-9ba0-dc161309f91b",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "40d47ad3-4e00-47c7-8e9b-c548f4e9f41e",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"I hope I answered your question.  You can ask anything else you might want to know.\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "I hope I answered your question.  You can ask anything else you might want to know.",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"I hope I answered your question.  You can ask anything else you might want to know.\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "I hope I answered your question.  You can ask anything else you might want to know."
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeInitialResponseMulti": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"To help me clarify your goal, please choose a number from the following list:\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "To help me clarify your goal, please choose a number from the following list:",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"To help me clarify your goal, please choose a number from the following list:\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "cf5a258b-c095-4f42-aba1-d9c917897634",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "822461c7-6661-4143-a27e-4020620e1f12",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"To help me clarify your goal, please choose a number from the following list:\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "To help me clarify your goal, please choose a number from the following list:",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"To help me clarify your goal, please choose a number from the following list:\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "To help me clarify your goal, please choose a number from the following list:"
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeInitialResponseMultiRetry": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"Please choose a number, for example '1'.\\nHere's the list of options again:\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "Please choose a number, for example '1'.\nHere's the list of options again:",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"Please choose a number, for example '1'.\\nHere's the list of options again:\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "87d07607-6c6d-463a-925b-4cb8f11d75cc",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "ddad746d-32d5-40ee-918e-dfdfa6ee76ec",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"Please choose a number, for example '1'.\\nHere's the list of options again:\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "Please choose a number, for example '1'.\nHere's the list of options again:",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"Please choose a number, for example '1'.\\nHere's the list of options again:\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "Please choose a number, for example '1'.\nHere's the list of options again:"
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeInitialResponseSingle": {
                "config": {
                    "emp": {
                        "pos": 1,
                        "text": "",
                        "type": "com"
                    }
                },
                "text": "",
                "type": "com",
                "uiMetaData": {
                    "mode": 3
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeAnswerHighlight": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "false",
                        "type": "bln"
                    }
                },
                "text": "false",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeAnswerHighlightFullArticle": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "View Full Article",
                        "type": "str"
                    }
                },
                "text": "View Full Article",
                "type": "str",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeAnswerHighlightFlowProgression": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "Continue",
                        "type": "str"
                    }
                },
                "text": "Continue",
                "type": "str",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeNoMatch": {
                "config": {
                    "MakeCommunication": {
                        "pos": 1,
                        "text": "MakeCommunication(ToCommunication(ToCommunication(\"None of these\")))",
                        "operands": [
                            {
                                "ToCommunication": {
                                    "pos": 22,
                                    "operands": [
                                        {
                                            "ToCommunication": {
                                                "pos": 38,
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 54,
                                                            "text": "None of these",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        }
                                    ],
                                    "type": "com"
                                }
                            }
                        ],
                        "type": "com"
                    }
                },
                "text": "MakeCommunication(\n  ToCommunication(ToCommunication(\"None of these\")))",
                "type": "com",
                "uiMetaData": {
                    "mode": 4,
                    "builder": {
                        "builderDefId": "__BUILDER_MARKDOWN_COMMUNICATION__",
                        "id": "6804e0b7-335a-4183-9827-e24522bf62ba",
                        "version": 1,
                        "builderParts": [
                            {
                                "builderPartDefId": "__BUILDER_PART_COMMUNICATION_MARKDOWN__",
                                "id": "6007b723-9363-4895-8e23-d9158e0f73fd",
                                "outOfService": false,
                                "version": 1,
                                "builderPartExpressions": [
                                    {
                                        "config": {
                                            "ToCommunication": {
                                                "pos": 1,
                                                "text": "ToCommunication(\"None of these\")",
                                                "operands": [
                                                    {
                                                        "lit": {
                                                            "pos": 1,
                                                            "text": "None of these",
                                                            "type": "str"
                                                        }
                                                    }
                                                ],
                                                "type": "com"
                                            }
                                        },
                                        "text": "\"None of these\"",
                                        "type": "com",
                                        "uiMetaData": {
                                            "mode": 0,
                                            "markdownText": "None of these"
                                        },
                                        "metaData": {},
                                        "version": 2
                                    }
                                ]
                            }
                        ]
                    }
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "maxNumOfAnswersReturned": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "3",
                        "type": "int"
                    }
                },
                "text": "3",
                "type": "int",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgePathMode": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "statement",
                        "type": "str"
                    }
                },
                "text": "statement",
                "type": "str",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2
            },
            "KnowledgeBase": {},
            "responseBias": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "neutral",
                        "type": "str"
                    }
                },
                "text": "neutral",
                "type": "str",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "sendKnowledgeFeedback": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "true",
                        "type": "bln"
                    }
                },
                "text": "true",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "knowledgeSettingsMode": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "standard",
                        "type": "str"
                    }
                },
                "text": "standard",
                "type": "str",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            }
        },
        "virtualAgentSettings": {
            "summarization": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "false",
                        "type": "bln"
                    }
                },
                "text": "false",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "assignWrapupCodes": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "false",
                        "type": "bln"
                    }
                },
                "text": "false",
                "type": "bln",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            },
            "enabledWrapupCodes": {
                "config": {
                    "lit": {
                        "pos": 1,
                        "text": "",
                        "type": "wrc_coll",
                        "items": []
                    }
                },
                "text": "",
                "type": "wrc_coll",
                "uiMetaData": {
                    "mode": 1
                },
                "metaData": {},
                "version": 2,
                "outOfService": true
            }
        },
        "debugSettings": {},
        "customDefinitions": {
            "dataTypeDefinitions": []
        },
        "defaultSettings": {},
        "flowMetaData": {
            "flowDocumentVersion": "1.0",
            "minimumServerVersion": "1.0",
            "ttsDataVersion": "1.0"
        },
        "flowSequenceItemList": [
            {
                "startAction": disconnectAction.id,
                "trackingId": 10,
                "id": initialSequenceId,
                "name": "Initial Greeting",
                "__type": "BotState",
                "actionList": [disconnectAction],
                "variables": []
            }
        ],
        "supportedLanguageOptions": [
            {
                "language": "en-US",
                "languageSkill": {
                    "config": {
                        "emp": {
                            "pos": 1,
                            "text": "",
                            "type": "lac"
                        }
                    },
                    "text": "",
                    "type": "lac",
                    "uiMetaData": {
                        "mode": 3
                    },
                    "metaData": {},
                    "version": 2
                }
            }
        ],
        "variables": []
    }

    for (let intent in originalFlow.nluMetaData.intents) {
        flowVersionBody.nluMetaData.intents[intent] = {confirmation: {
            text: `ToCommunication("I think you want to ${intent}, is that correct?")`,
            type: "com"
        }};
    }
    flowVersionBody.nluMetaData.rawNlu = JSON.stringify({ intents: JSON.parse(originalFlow.nluMetaData.rawNlu).intents });
    flowVersionBody.userInputSettings = originalFlow.userInputSettings;

    for (let key in originalFlow.nluMetaData.mappings.intentsToReusableTasks) {
        const newTask = createTaskAction(key);
        flowVersionBody.flowSequenceItemList.push(newTask);
        flowVersionBody.nluMetaData.mappings.intentsToReusableTasks[key] = { id: newTask.id }
    }

    await makeGenesysRequest(`/api/v2/flows/${newFlow.id}/versions`, "POST", flowVersionBody);

    return await makeGenesysRequest(`/api/v2/flows/actions/publish?flow=${newFlow.id}`, "POST");
}

function encodeFlow(flow) {
    return btoa(encodeURIComponent(JSON.stringify(flow)))
}

function updateFlow() {

}

function copyUtterancesFromAToB(sourceFile, targetFile, intentName) {
    let sourceNLU = JSON.parse(sourceFile.nluMetaData.rawNlu);
    let targetNLU = JSON.parse(targetFile.nluMetaData.rawNlu);
    for (let intent of sourceNLU.intents) {
        if (intent.name === intentName) {
            targetNLU.intents.push(intent);
        }
    }
    targetNLU.nluMetaData.rawNlu = JSON.stringify(targetNLU);
}

function createTaskAction(name) {
    const disconnectAction = createDisconnectAction();
    return {
        actionList: [disconnectAction],
        name: name,
        id: crypto.randomUUID(),
        startAction: disconnectAction.id,
        variables: [],
        "__type": "Task"
    }
}

function createDisconnectAction() {
    return {
        id: crypto.randomUUID(),
        name: "Disconnect",
        "__type": "DisconnectAction"
    }
}

// should start a subscription when publishing
// then wait until I get the completed result
// and then end the subscription
// need to use notificaitons for it
// https://developer.genesys.cloud/notificationsalerts/notifications/notifications-apis

// POST
// /api/v2/notifications/channels
// return {"connectUri": "", "id": "", "expires": ""}

// POST
// https://api.usw2.pure.cloud/api/v2/notifications/channels/${channelId}/subscriptions
// [{"id": `flow.${flowId}` }]

runLoginProcess(showLoginPage, showMainMenu);