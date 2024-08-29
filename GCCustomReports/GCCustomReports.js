window.levels = ["conversation", "participant", "session", "segment"];
window.fields = {
    // usersMapping, queueMapping, wrapupCodeMapping, divisionMapping, knowledgeBaseMapping
    "Conversation": [
        // { name: "Conference Start", path: "conferenceStart", level: "interaction", type: "timestamp" },
        { name: "Conversation End", path: "conversationEnd", level: "interaction", type: "timestamp" },
        { name: "Conversation ID", path: "conversationId", level: "interaction", type: "text" },
        { name: "Conversation Initiator", path: "conversationInitator", level: "interaction", type: "text" },
        { name: "Conversation Start", path: "conversationStart", level: "interaction", type: "timestamp" },
        { name: "Customer Participation", path: "customerParticipation", level: "interaction", type: "boolean" },
        { name: "Division IDs", path: "divisionIds", level: "interaction", mapping: "divisionMapping", type: "text" },
        { name: "External Tag", path: "externalTag", level: "interaction", type: "text" },
        { name: "Knowledge Base IDs", path: "knowledgeBaseIds", level: "interaction", mapping: "knowledgeBaseMapping", type: "text" },
        // { name: "Min Conversation MOS", path: "mediaStatsMinConversationMos", level: "interaction", type: "number" },
        // { name: "Min Conversation R Factor", path: "mediaStatsMinConversationRFactor", level: "interaction", type: "number" },
        { name: "Originating Direction", path: "originatingDirection", level: "interaction", type: "text" },
        { name: "Self Served", path: "selfServed", level: "interaction", type: "boolean" },

        // { name: "Evaluations", path: "evaluations", level: "interaction", type: "text" },
        { name: "Evaluation Assignees Applicable", path: "evaluations.assigneeApplicable", level: "interaction", type: "boolean" },
        { name: "Evaluation Assignee IDs", path: "evaluations.assigneeId", level: "interaction", mapping: "usersMapping", type: "text" },
        { name: "Evaluation Calibration IDs", path: "evaluations.calibrationId", level: "interaction", type: "text" },
        { name: "Evaluation Context IDs", path: "evaluations.contextId", level: "interaction", type: "text" },
        { name: "Evaluation Deleted", path: "evaluations.deleted", level: "interaction", type: "boolean" },
        { name: "Evaluation IDs", path: "evaluations.evaluationId", level: "interaction", type: "text" },
        { name: "Evaluation Statuses", path: "evaluations.evaluationStatus", level: "interaction", type: "text" },
        { name: "Evaluation Evaluator IDs", path: "evaluations.evaluatorId", level: "interaction", mapping: "usersMapping", type: "text" },
        { name: "Evaluation Event Times", path: "evaluations.eventTime", level: "interaction", type: "text" },
        { name: "Evaluation Form IDs", path: "evaluations.formId", level: "interaction", type: "text" },
        { name: "Evaluation Form Names", path: "evaluations.formName", level: "interaction", type: "text" },
        { name: "Evaluation Queue IDs", path: "evaluations.queueId", level: "interaction", mapping: "queueMapping", type: "text" },
        { name: "Evaluation Released", path: "evaluations.released", level: "interaction", type: "boolean" },
        { name: "Evaluation Rescored", path: "evaluations.rescored", level: "interaction", type: "boolean" },
        { name: "Evaluation User IDs", path: "evaluations.userId", level: "interaction", mapping: "usersMapping", type: "text" },
        { name: "Evaluation Total Critical Scores", path: "evaluations.oTotalCriticalScore", level: "interaction", type: "number" },
        { name: "Evaluation Total Scores", path: "evaluations.oTotalScore", level: "interaction", type: "number" },

        // { name: "Surveys", path: "surveys", level: "interaction" },
        { name: "Survey Event Times", path: "surveys.eventTime", level: "interaction" },
        { name: "Survey Queue IDs", path: "surveys.queueId", level: "interaction", mapping: "queueMapping" },
        { name: "Survey Completed Dates", path: "surveys.surveyCompletedDate", level: "interaction" },
        { name: "Survey Form Context IDs", path: "surveys.surveyFormContextId", level: "interaction" },
        { name: "Survey Form IDs", path: "surveys.surveyFormId", level: "interaction" },
        { name: "Survey Form Names", path: "surveys.surveyFormName", level: "interaction" },
        { name: "Survey IDs", path: "surveys.surveyId", level: "interaction" },
        { name: "Survey Partial Responses", path: "surveys.surveyPartialResponse", level: "interaction" },
        { name: "Survey Promoter Scores", path: "surveys.surveyPromoterScore", level: "interaction" },
        { name: "Survey Statuses", path: "surveys.surveyStatus", level: "interaction" },
        { name: "Survey Types", path: "surveys.surveyType", level: "interaction" },
        { name: "Survey User IDs", path: "surveys.userId", level: "interaction", mapping: "usersMapping" },
        { name: "Survey Total Scores", path: "surveys.oSurveyTotalScore", level: "interaction" },

        // { name: "Resolutions", path: "resolutions", level: "interaction" },
        { name: "Resolution Event Times", path: "resolutions.eventTime", level: "interaction" },
        { name: "Resolution Queue IDs", path: "resolutions.queueId", level: "interaction", mapping: "queueMapping" },
        { name: "Resolutions User IDs", path: "resolutions.userId", level: "interaction", mapping: "usersMapping" },
        { name: "Resolutions Next Contact Avoided", path: "resolutions.nNextContactAvoided", level: "interaction" },
    ],
    "Participant": [
        { name: "External Contact ID", path: "externalContactId", level: "participant" },
        { name: "External Org ID", path: "externalOrganizationId", level: "participant" },
        { name: "Flagged Reason", path: "flaggedReason", level: "participant" },
        { name: "Participant ID", path: "participantId", level: "participant" },
        { name: "Participant Name", path: "participantName", level: "participant" },
        { name: "Purpose", path: "purpose", level: "participant" },
        { name: "Team ID", path: "teamId", level: "participant" },
        { name: "User ID", path: "userId", level: "participant", mapping: "usersMapping" },
        { name: "Attributes", path: "attributes", level: "participant" },
    ],
    "Session": [
        { name: "Active Skill IDs", path: "activeSkillIds", level: "session", type: "text" },
        { name: "ACW Skipped", path: "acwSkipped", level: "session", type: "boolean" },
        { name: "Address From", path: "addressFrom", level: "session", type: "text" },
        { name: "Address Other", path: "addressOther", level: "session", type: "text" },
        { name: "Address Self", path: "addressSelf", level: "session", type: "text" },
        { name: "Address To", path: "addressTo", level: "session", type: "text" },
        { name: "Agent Assistant ID", path: "agentAssistantId", level: "session", type: "text" },
        { name: "Agent Bullseye Ring", path: "agentBulleyeRing", level: "session", type: "number" },
        { name: "Agent Owned", path: "agentOwned", level: "session", type: "boolean" },
        { name: "ANI", path: "ani", level: "session", type: "text" },
        { name: "Assigner ID", path: "assignerId", level: "session", type: "text" },
        { name: "Authenticated", path: "authenticated", level: "session", type: "boolean" },
        { name: "Barged Participant ID", path: "bargedParticipantId", level: "session", type: "text" },
        { name: "BCC", path: "bcc", level: "session", type: "text" },
        { name: "Callback Numbers", path: "callbackNumbers", level: "session", type: "text" },
        { name: "Callback Scheduled Time", path: "callbackScheduledTime", level: "session", type: "timestamp" },
        { name: "Callback User Name", path: "callbackUserName", level: "session", type: "text" },
        { name: "CC", path: "cc", level: "session", type: "text" },
        { name: "Cleared", path: "cleared", level: "session", type: "boolean" },
        { name: "Coached Participant ID", path: "coachedParticipantId", level: "session", type: "text" },
        { name: "Cobrowse Role", path: "cobrowseRole", level: "session", type: "text" },
        { name: "Cobrowse Room ID", path: "cobrowseRoomId", level: "session", type: "text" },
        { name: "Delivery Status", path: "deliveryStatus", level: "session", type: "text" },
        { name: "Delivery Status Changed Date", path: "deliveryStatusChangeDate", level: "session", type: "timestamp" },
        { name: "Destination Addresses", path: "destinationAddresses", level: "session", type: "text" },
        { name: "Direction", path: "direction", level: "session", type: "text" },
        { name: "Dispostion Analyzer", path: "dispositionAnalyzer", level: "session", type: "text" },
        { name: "Disposition Name", path: "dispositionName", level: "session", type: "text" },
        { name: "DNIS", path: "dnis", level: "session", type: "text" },
        { name: "Edge ID", path: "edgeId", level: "session", type: "text" },
        { name: "Eligible Agent Counts", path: "eligibleAgentCounts", level: "session", type: "number" },
        { name: "Extended Delivery Status", path: "extendedDeliveryStatus", level: "session", type: "text" },
        { name: "Flow In Type", path: "flowInType", level: "session", type: "text" },
        { name: "Flow Out Type", path: "flowOutType", level: "session", type: "text" },
        { name: "Journey Action ID", path: "journeyActionId", level: "session", type: "text" },
        { name: "Journey Action Map ID", path: "journeyActionMapId", level: "session", type: "text" },
        { name: "Journey Action Map Version", path: "journeyActionMapVersion", level: "session", type: "number" },
        { name: "Journey Customer ID", path: "journeyCustomerId", level: "session", type: "text" },
        { name: "Journey Customer ID Type", path: "journeyCustomerIdType", level: "session", type: "text" },
        { name: "Journey Customer Session ID", path: "journeyCustomerSessionId", level: "session", type: "text" },
        { name: "Journey Customer Session ID Type", path: "journeyCustomerSessionIdType", level: "session", type: "text" },
        { name: "Media Bridge ID", path: "mediaBridgeId", level: "session", type: "text" },
        { name: "Media Count", path: "mediaCount", level: "session", type: "number" },
        { name: "Media Type", path: "mediaType", level: "session", type: "text" },
        { name: "Message Type", path: "messageType", level: "session", type: "text" },
        { name: "Monitored Participant ID", path: "monitoredParticipantId", level: "session", type: "text" },
        { name: "Outbount Campaign ID", path: "outboundCampaignId", level: "session", type: "text" },
        { name: "Outbount Contact ID", path: "outboundContactId", level: "session", type: "text" },
        { name: "Outbount Contact List ID", path: "outboundContactListId", level: "session", type: "text" },
        { name: "Peer ID", path: "peerId", level: "session", type: "text" },
        { name: "Protocol Call ID", path: "protocolCallId", level: "session", type: "text" },
        { name: "Provider", path: "provider", level: "session", type: "text" },
        { name: "Recording", path: "recording", level: "session", type: "boolean" },
        { name: "Remote", path: "remote", level: "session", type: "text" },
        { name: "Remote Name Displayable", path: "remoteNameDisplayable", level: "session", type: "text" },
        { name: "Removed Skill IDs", path: "removedSkillIds", level: "session", type: "text" },
        { name: "Requested Routings", path: "requestedRoutings", level: "session", type: "text" },
        { name: "Room ID", path: "roomId", level: "session", type: "text" },
        { name: "Routing Ring", path: "routingRing", level: "session", type: "boolean" },
        { name: "Routing Rule", path: "routingRule", level: "session", type: "text" },
        { name: "Routing Rule Type", path: "routingRuleType", level: "session", type: "text" },
        { name: "Screen Share Address Self", path: "screenShareAddressSelf", level: "session", type: "text" },
        { name: "Screen Share Room ID", path: "screenShareRoomId", level: "session", type: "text" },
        { name: "Script ID", path: "scriptId", level: "session", type: "text" },
        { name: "Selected Agent ID", path: "selectedAgentId", level: "session", mapping: "usersMapping", type: "text" },
        { name: "Selected Agent Rank", path: "selectedAgentRank", level: "session", type: "number" },
        { name: "Session DNIS", path: "sessionDnis", level: "session", type: "text" },
        { name: "Session ID", path: "sessionId", level: "session", type: "text" },
        { name: "Sharing Screen", path: "sharingScreen", level: "session", type: "boolean" },
        { name: "Skip Enabled", path: "skipEnabled", level: "session", type: "boolean" },
        { name: "Timeout Seconds", path: "timeoutSeconds", level: "session", type: "number" },
        { name: "Used Routing", path: "usedRouting", level: "session", type: "text" },
        { name: "Video Address Self", path: "videoAddressSelf", level: "session", type: "text" },
        { name: "Video Room ID", path: "videoRoomId", level: "session", type: "text" },
        { name: "Waiting Interaction Counts", path: "waitingInteractionCounts", level: "session", type: "number" },

        // { name: "Agent Groups", path: "agentGroups", level: "session" },
        { name: "Agent Group IDs", path: "agentGroups.agentGroupId", level: "session" },
        { name: "Agent Group Types", path: "agentGroups.agentGroupType", level: "session" },

        // { name: "Proposed Agents", path: "proposedAgents", level: "session" },
        { name: "Proposed Agent Ranks", path: "proposedAgents.agentRank", level: "session" },
        { name: "Proposed Agent IDs", path: "proposedAgents.proposedAgentId", level: "session", mapping: "usersMapping" },

        // { name: "Media Endpoint Stats", path: "mediaEndpointStats", level: "session" },
        // { name: "Media Endpoint Stat Codecs", path: "mediaEndpointStats.codecs", level: "session" },
        // { name: "Media Endpoint Stat Discarded Packets", path: "mediaEndpointStats.discardedPackets", level: "session" },
        // { name: "Media Endpoint Stat Duplicate Packets", path: "mediaEndpointStats.duplicatePackets", level: "session" },
        // { name: "Media Endpoint Stat Event Times", path: "mediaEndpointStats.eventTime", level: "session" },
        // { name: "Media Endpoint Stat Invalid Packets", path: "mediaEndpointStats.invalidPackets", level: "session" },
        // { name: "Media Endpoint Stat Max Latencies MS", path: "mediaEndpointStats.maxLatencyMs", level: "session" },
        // { name: "Media Endpoint Stat Min MOS", path: "mediaEndpointStats.minMos", level: "session" },
        // { name: "Media Endpoint Stat Min R Factors", path: "mediaEndpointStats.minRFactor", level: "session" },
        // { name: "Media Endpoint Stat Overrun Packets", path: "mediaEndpointStats.overrunPackets", level: "session" },
        // { name: "Media Endpoint Stat Received Packets", path: "mediaEndpointStats.receivedPackets", level: "session" },
        // { name: "Media Endpoint Stat Underrun Packets", path: "mediaEndpointStats.underrunPackets", level: "session" },

        // { name: "Flow", path: "flow", level: "session" },
        { name: "Flow Ending Language", path: "flow.endingLanguage", level: "session" },
        { name: "Flow Entry Reason", path: "flow.entryReason", level: "session" },
        { name: "Flow Entry Type", path: "flow.entryType", level: "session" },
        { name: "Flow Exit Reason", path: "flow.exitReason", level: "session" },
        { name: "Flow ID", path: "flow.flowId", level: "session" },
        { name: "Flow Name", path: "flow.flowName", level: "session" },
        { name: "Flow Type", path: "flow.flowType", level: "session" },
        { name: "Flow Version", path: "flow.flowVersion", level: "session" },
        { name: "Flow Issued Callback", path: "flow.issuedCallback", level: "session" },
        { name: "Flow Recognition Failure Reason", path: "flow.recognitionFailureReason", level: "session" },
        { name: "Flow Starting Language", path: "flow.startingLanguage", level: "session" },
        { name: "Flow Transfer Target Address", path: "flow.transferTargetAddress", level: "session" },
        { name: "Flow Transfer Target Name", path: "flow.transferTargetName", level: "session" },
        { name: "Flow Transfer Type", path: "flow.transferType", level: "session" },
        { name: "Flow Outcomes", path: "flow.outcomes", level: "session" },
        { name: "Flow Outcome Names", path: "flow.outcomes.flowOutcome", level: "session" },
        { name: "Flow Outcome End Timestamps", path: "flow.outcomes.flowOutcomeEndTimestamp", level: "session" },
        { name: "Flow Outcome IDs", path: "flow.outcomes.flowOutcomeId", level: "session" },
        { name: "Flow Outcome Start Timestamps", path: "flow.outcomes.flowOutcomeStartTimestamp", level: "session" },
        { name: "Flow Outcome Values", path: "flow.outcomes.flowOutcomeValue", level: "session" },

        // { name: "Metrics", path: "metrics", level: "session" },
        { name: "Metric Emit Dates", path: "metrics.emitDate", level: "session" },
        { name: "Metric Names", path: "metrics.name", level: "session" },
        { name: "Metric Values", path: "metrics.value", level: "session" },
    ],
    "Segment": [
        // { name: "Audio Muted", path: "audioMuted", level: "segment" },
        // { name: "Conference", path: "conference", level: "segment" },
        { name: "Destination Conversation ID", path: "destinationConversationId", level: "segment" },
        { name: "Destination Session ID", path: "destinationSessionId", level: "segment" },
        { name: "Disconnect Type", path: "disconnectType", level: "segment" },
        { name: "Error Code", path: "errorCode", level: "segment" },
        { name: "Group ID", path: "groupId", level: "segment" },
        // { name: "Q.850 Response Codes", path: "q850ResponseCodes", level: "segment" },
        { name: "Queue ID", path: "queueId", level: "segment", mapping: "queueMapping" },
        { name: "Requested Language ID", path: "requestedLanguageId", level: "segment" },
        { name: "Requested Routing Skill IDs", path: "requestedRoutingSkillIds", level: "segment" },
        { name: "Requested Routing User IDs", path: "requestedRoutingUserIds", level: "segment" },
        { name: "Segment End", path: "segmentEnd", level: "segment" },
        { name: "Segment Start", path: "segmentStart", level: "segment" },
        { name: "Segment Type", path: "segmentType", level: "segment" },
        // { name: "SIP Response Codes", path: "sipResponseCodes", level: "segment" },
        // { name: "Source Conversation IDs", path: "sourceConversationId", level: "segment" },
        // { name: "Source Session ID", path: "sourceSessionId", level: "segment" },
        { name: "Subject", path: "subject", level: "segment" },
        // { name: "Video Muted", path: "videoMuted", level: "segment" },
        { name: "Wrap-Up Code", path: "wrapUpCode", level: "segment", mapping: "wrapupCodeMapping" },
        { name: "Wrap-Up Notes", path: "wrapUpNote", level: "segment" },
        // { name: "Wrap-Up Tags", path: "wrapUpTags", level: "segment" },

        // { name: "Scored Agents", path: "scoredAgents", level: "segment" },
        { name: "Scored Agent Scores", path: "scoredAgents.agentScore", level: "segment" },
        { name: "Scored Agent IDs", path: "scoredAgents.scoredAgentId", level: "segment", mapping: "usersMapping" },

        // { name: "Properties", path: "properties", level: "segment" },
        { name: "Property Properties", path: "properties.property", level: "segment" },
        { name: "Property Types", path: "properties.propertyType", level: "segment" },
        { name: "Property Values", path: "properties.value", level: "segment" },
    ]
}

async function conversationDetailsJob(startDate, endDate) {
    // Submit a query to create a job. A jobId will be returned. Hang onto this jobId 
    // (HTTP POST /api/v2/analytics/conversations/details/jobs).
    const newJob = await createJob(startDate, endDate);
    // Armed with your jobId, you should now periodically poll for the status of your job 
    // (HTTP GET /api/v2/analytics/conversations/details/jobs/{jobId}).
    await pollStatus(makeGenesysRequest, [`/api/v2/analytics/conversations/details/jobs/${newJob.jobId}`], "state", ["FULFILLED"], ["FAILED"], 2000);

    // Is your job still running? Did it fail? Has it successfully completed gathering all of your data? 
    // Depending on load and the volume of data being queried, it might be on the order of seconds to minutes before you see your job complete.
    // If and only if your job has successfully completed, is it time for you to retrieve the results. 
    // At this point, you can ask for the first page of data back 
    // (HTTP GET /api/v2/analytics/conversations/details/jobs/{jobId}/results). 
    const results = await getAllGenesysItems(`/api/v2/analytics/conversations/details/jobs/${newJob.jobId}/results`, 100, "conversations");

    // Alongside the results of your query, you will find a cursor. 
    // This is what you will use to advance to the next page of data (that is, this is an iterator and not random-access/numbered-page-style access). 
    // Use that cursor as a query parameter on the URL to advance to the next page of results. 
    // Each page will have a unique cursor to advance you forward. If there is no cursor in the page response, there is no data beyond this page.
    return results;
}

async function createJob(startDate, endDate) {
    const body = {
        "order": "desc",
        "orderBy": "conversationStart",
        "segmentFilters": [],
        "conversationFilters": [
            {
                "type": "or",
                "predicates": [
                    {
                        "dimension": "conversationEnd",
                        "operator": "exists"
                    }
                ]
            }
        ],
        "evaluationFilters": [],
        "surveyFilters": [],
        "interval": `${startDate}/${endDate}`
    }
    return makeGenesysRequest(`/api/v2/analytics/conversations/details/jobs`, 'POST', body);
}

async function getBotTurns(botFlowId, start, end) {
    return makeGenesysRequest(`/api/v2/analytics/botflows/${botFlowId}/reportingturns?interval=${start}/${end}`);
}

async function getRecording(conversationId) {
    return makeGenesysRequest(`/api/v2/conversations/${conversationId}/recordings`);
}

function addIfProperty(object, path, orValue, mapping) {
    const pathParts = path.split(".");
    let currentPiece = object;
    for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (Array.isArray(currentPiece)) {
            const displayList = [];
            for (let item of currentPiece) {
                const hasPart = item.hasOwnProperty(part);
                if (hasPart) {
                    if (typeof item[part] === "object") {
                        displayList.push(JSON.stringify(item[part]));
                        continue;
                    }
                    if (mapping && window[mapping]) {
                        displayList.push(window[mapping].hasOwnProperty(item[part]) ? window[mapping][item[part]] : item[part]);
                        continue;
                    }
                    displayList.push(item[part])
                }
            }
            return displayList.join("\n")
        }
        const hasPart = currentPiece.hasOwnProperty(part);
        if (hasPart && i + 1 < pathParts.length) {
            currentPiece = currentPiece[part];
            continue;
        }
        if (hasPart) {
            if (Array.isArray(currentPiece[part])) {
                const displayList = [];
                for (let item of currentPiece[part]) {
                    if (typeof item === "object") {
                        displayList.push(JSON.stringify(item));
                        continue;
                    }
                    if (mapping && window[mapping]) {
                        displayList.push(window[mapping].hasOwnProperty(item) ? window[mapping][item] : item);
                        continue;
                    }
                    displayList.push(item)
                }
                return displayList.join("\n")
            }
            if (typeof currentPiece[part] === "object") {
                return JSON.stringify(currentPiece[part])
            }
            if (mapping && window[mapping]) {
                return window[mapping].hasOwnProperty(currentPiece[part]) ? window[mapping][currentPiece[part]] : currentPiece[part];
            }
            return currentPiece[part]
        }
    }
    return orValue ? orValue : "";
}

function getAllConversationSegments(interaction, fieldsInfo, dataLevel, filters) {
    const dataRows = [];
    const level = dataLevel.toLowerCase();
    const dataLevelIndex = window.levels.indexOf(level);
    const currentItems = {
        conversation: interaction,
        participant: undefined,
        session: undefined,
        segment: undefined
    }
    if (dataLevel === "Conversation") {
        const participants = interaction.participants;
        const sessions = [];
        const segments = [];
        for (let participant of interaction.participants) {
            for (let session of participant.sessions) {
                sessions.push(session);
                for (let segment of session.segments) {
                    segments.push(segment);
                }
            }
        }
        const wasFiltered = filterConversation({ conversation: [interaction], participant: participants, session: sessions, segment: segments }, filters);
        if (wasFiltered) {
            const dataRow = createDataRow(fieldsInfo, dataLevelIndex, currentItems);
            dataRows.push(dataRow);
        }
    }
    else {
        for (let participant of interaction.participants) {
            currentItems.participant = participant;
            if (dataLevel === "Participant") {
                const sessions = participant.sessions;
                const segments = [];
                for (let session of participant.sessions) {
                    for (let segment of session.segments) {
                        segments.push(segment);
                    }
                }
                const wasFiltered = filterConversation({ conversation: [interaction], participant: [participant], session: sessions, segment: segments }, filters);
                if (wasFiltered) {
                    const dataRow = createDataRow(fieldsInfo, dataLevelIndex, currentItems);
                    dataRows.push(dataRow);
                }
            }
            else {
                for (let session of participant.sessions) {
                    currentItems.session = session;
                    if (dataLevel === "Session") {
                        const segments = session.segments;
                        const wasFiltered = filterConversation({ conversation: [interaction], participant: [participant], session: [session], segment: segments }, filters);
                        if (wasFiltered) {
                            const dataRow = createDataRow(fieldsInfo, dataLevelIndex, currentItems);
                            dataRows.push(dataRow);
                        }
                    }
                    else {
                        for (let segment of session.segments) {
                            currentItems.segment = segment;
                            const wasFiltered = filterConversation({ conversation: [interaction], participant: [participant], session: [session], segment: [segment] }, filters);
                            if (wasFiltered) {
                                const dataRow = createDataRow(fieldsInfo, dataLevelIndex, currentItems);
                                dataRows.push(dataRow);
                            }
                        }
                    }
                }
            }
        }
    }
    return dataRows;
}

function createDataRow(fieldsInfo, dataLevelIndex, currentItems) {
    const dataRow = [];
    for (let field of fieldsInfo) {
        const fieldLevel = levels.indexOf(field.level);
        if (dataLevelIndex >= fieldLevel) {
            dataRow.push(addIfProperty(currentItems[field.level], field.path, "", field.mapping));
        }
    }
    return dataRow;
}

async function run() {
    // reset globals 
    window.allConversations = {};

    const start = eById("startDate").value;
    const end = eById("endDate").value;
    const dataLevel = eById("level").value;

    if (!start || !end) throw new Error("Need a start or end date");
    const conversationsCacheKey = btoa(encodeURIComponent(`${window.orgId}:${start}:${end}`));
    const orgInfoCacheKey = btoa(encodeURIComponent(window.orgId));

    const startDate = start + "T00:00:00.000Z";
    const endDate = end + "T23:59:59.999Z";

    if (window.orgInfoCacheKey !== orgInfoCacheKey) {
        const users = await getAllGenesysItems(`/api/v2/users?state=active`, 100, "entities");
        window.usersMapping = mapProperty("id", "name", users);
        const queues = await getAllGenesysItems("/api/v2/routing/queues?sortOrder=asc&sortBy=name&name=**&divisionId", 50, "entities");
        window.queueMapping = mapProperty("id", "name", queues);
        const wrapupCodes = await getAllGenesysItems("/api/v2/routing/wrapupcodes?sortBy=name&sortOrder=ascending", 50, "entities");
        window.wrapupCodeMapping = mapProperty("id", "name", wrapupCodes);
        const divisions = await getAllGenesysItems("/api/v2/authorization/divisions?", 200, "entities");
        window.divisionMapping = mapProperty("id", "name", divisions);
        const knowledgeBases = await getAllGenesysItems("/api/v2/knowledge/knowledgeBases?sortOrder=ASC&sortBy=name", 50, "entities");
        window.knowledgeBaseMapping = mapProperty("id", "name", knowledgeBases);
        window.orgInfoCacheKey = orgInfoCacheKey;
    }

    if (window.conversationsCacheKey !== conversationsCacheKey) {
        window.conversationsData = await conversationDetailsJob(startDate, endDate);
        window.conversationsCacheKey = conversationsCacheKey;
    }
    const selectedFields = qsa(".fieldOption", eById('fieldContainer'));

    const headers = [];
    const fields = [];
    for (let field of selectedFields) {
        const level = qs(".fieldLevel", field).value.toLowerCase();
        let fieldPath = qs(".fieldType", field).value;
        let fieldName = qs(".fieldType", field).selectedOptions[0].innerText;
        let mapping = qs(".fieldType", field).selectedOptions[0].dataset.mappingName
        if (fieldPath === "custom") {
            fieldPath = qs(".customPath", field).value;
            fieldName = qs(".customPath", field).value;
        }
        const dataLevelIndex = window.levels.indexOf(dataLevel.toLowerCase());
        const fieldLevel = window.levels.indexOf(level);
        if (dataLevelIndex >= fieldLevel) {
            headers.push(fieldName);
            fields.push({ name: fieldName, path: fieldPath, level: level, mapping: mapping })
        }
    }
    let dataRows = [];
    let filters = [];
    const filterContainer = qs('.filterContainer');
    if (filterContainer) {
        filters = parseFilters(filterContainer);
    }
    for (let conversation of window.conversationsData) {
        window.allConversations[conversation.conversationId] = conversation;
        // getConversationTurns(conversation);
        dataRows = dataRows.concat(getAllConversationSegments(conversation, fields, dataLevel, filters));
    }
    window.displayTable = new PagedTable(headers, dataRows, 100, {}, true, true);
    const results = eById("results");
    clearElement(results);
    addElement(window.displayTable.getContainer(), results);

    return;
}

function mapProperty(propA, propB, objects) {
    const mapping = {};
    for (let object of objects) {
        mapping[object[propA]] = object[propB]
    }
    return mapping;
}

function sortByKey(key) {
    return function (a, b) {
        if (a[key] > b[key]) return 1;
        if (a[key] < b[key]) return -1;
        return 0;
    }
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

function showMainMenu() {
    const page = eById('page');
    clearElement(page);
    const inputs = newElement("div", { id: "inputs" });
    const startLabel = newElement('label', { innerText: "Start Date: " });
    const startDate = newElement('input', { type: "date", id: "startDate", value: "2024-04-01" });
    addElement(startDate, startLabel);
    const endLabel = newElement('label', { innerText: "End Date: " });
    const endDate = newElement('input', { type: "date", id: "endDate", value: "2024-04-30" });
    addElement(endDate, endLabel);
    const levelLabel = newElement('label', { innerText: "Data Level: " });
    const levelSelect = newElement('select', { id: "level" });
    for (let item of ["Conversation", "Participant", "Session", "Segment"]) {
        const levelOption = newElement("option", { value: item, innerText: item });
        addElement(levelOption, levelSelect);
    }
    addElement(levelSelect, levelLabel)

    const filtersContainer = createFilterUI();
    const fieldContainer = newElement('div', { id: "fieldContainer" });
    const fieldsHeader = newElement('div', {innerText: "Columns:"});
    addElements([fieldsHeader, createFieldOptions()], fieldContainer);

    const startButton = newElement('button', { innerText: "Start" });
    registerElement(startButton, "click", () => { showLoading(run) });
    const downloadAllButton = newElement('button', { innerText: "Download All" });
    registerElement(downloadAllButton, "click", () => { if (!window.displayTable) return; const headers = window.displayTable.getHeaders(); const data = window.displayTable.getFullData(); const download = createDownloadLink("Full Data Export.csv", Papa.unparse([headers, ...data]), "text/csv"); download.click(); });
    const downloadFilteredButton = newElement('button', { innerText: "Download Filtered" });
    registerElement(downloadFilteredButton, "click", () => { if (!window.displayTable) return; const headers = window.displayTable.getHeaders(); const data = window.displayTable.getFilteredData(); const download = createDownloadLink("Filtered Data Export.csv", Papa.unparse([headers, ...data]), "text/csv"); download.click(); });
    const logoutButton = newElement('button', { innerText: "Logout" });
    registerElement(logoutButton, "click", logout);
    const results = newElement('div', { id: "results" })
    addElements([startLabel, endLabel, levelLabel], inputs)
    addElements([inputs, filtersContainer, fieldContainer, startButton, downloadAllButton, downloadFilteredButton, logoutButton, results], page);
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

var tabs = [];
var fileContents;

runLoginProcess(showLoginPage, showMainMenu);

function timeDiff(firstTime, secondTime) {
    firstTime = new Date(firstTime);
    secondTime = new Date(secondTime);
    return firstTime - secondTime;
}
function formattedForDisplay(seconds) {
    var sec_num = parseInt(seconds, 10)
    var hours = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours, minutes, seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v, i) => v !== "00" || i > 0)
        .join(":")
}

function createFieldOptions() {
    const fieldOptionContainer = newElement('div', { class: ["fieldOption"] });
    const removeButton = newElement("button", { innerText: "x", title: "Remove Field" });
    registerElement(removeButton, "click", () => { if (qsa(".fieldOption", fieldOptionContainer.parent).length === 1) return; fieldOptionContainer.remove() });
    const levelSelector = newElement("select", { class: ["fieldLevel"] });
    for (let level of ["Conversation", "Participant", "Session", "Segment"]) {
        const levelOption = newElement("option", { value: level, innerText: level });
        addElement(levelOption, levelSelector);
    }
    const addFieldButton = newElement("button", { innerText: "+", title: "Add Field Below" });
    registerElement(addFieldButton, "click", () => { addElement(createFieldOptions(), fieldOptionContainer, "afterend") });

    const fieldSelector = newElement("select", { class: ["fieldType"] });
    populateFieldSelector(fieldSelector, "Conversation");

    const customInput = newElement("input", { class: ["customPath"] });
    registerElement(levelSelector, "change", () => { customInput.remove(); clearElement(fieldSelector); populateFieldSelector(fieldSelector, levelSelector.value) });
    registerElement(fieldSelector, "change", () => { if (fieldSelector.value === "custom") { addElement(customInput, fieldSelector, "afterend") } else { customInput.remove(); } })

    addElements([levelSelector, fieldSelector, removeButton, addFieldButton], fieldOptionContainer);
    return fieldOptionContainer;
}

function populateFieldSelector(selector, level) {
    for (let field of fields[level]) {
        const option = newElement("option", { value: field.path, innerText: field.name, "data-field-type": field.type ? field.type : "" });
        if (field.hasOwnProperty("mapping")) option.setAttribute("data-mapping-name", field.mapping);
        addElement(option, selector)
    }
    const option = newElement("option", { value: "custom", innerText: "Custom" });
    addElement(option, selector);
}

function createDownloadLink(fileName, fileContents, fileType) {
    const fileData = new Blob([fileContents], { type: fileType });
    const fileURL = window.URL.createObjectURL(fileData);
    return newElement('a', { href: fileURL, download: fileName });
}

function createFilterUI() {
    const filterContainer = newElement('div', { class: ["filterContainer"] });
    const header = newElement("div", {innerText: "Filters:"});
    // const itemTypeLabel = newElement('label', { innerText: "Item Type: " });
    // const itemTypeSelect = newElement('select');
    // for (let itemType of ['Conversation', 'Participant', 'Session', 'Segment']) {
    //     const itemTypeOption = newElement('option', { value: itemType, innerText: itemType });
    //     addElement(itemTypeOption, itemTypeSelect);
    // }
    // addElement(itemTypeSelect, itemTypeLabel);
    const initialWhereClause = createWhereClauseUI(filterContainer);
    addElements([header, initialWhereClause], filterContainer);
    return filterContainer;
}

function createWhereClauseUI(parentElement) {
    const whereContainer = newElement('div', { class: ['whereContainer'] });

    const levelSelector = newElement('select', { class: ["filterLevel"] });
    for (let level of ['Conversation', 'Participant', 'Session', 'Segment']) {
        const levelOption = newElement('option', { value: level, innerText: level });
        addElement(levelOption, levelSelector);
    }

    const fieldSelector = newElement("select", { class: ["filterPath"] });
    populateFieldSelector(fieldSelector, "Conversation");

    registerElement(levelSelector, "change", () => { clearElement(fieldSelector); populateFieldSelector(fieldSelector, levelSelector.value) });

    const operatorSelector = newElement('select', { class: ["filterOperator"] });
    for (let operator of ["matches", "doesn't match", "contains", "doesn't contain", "has value", "has no value"]) {
        const operatorOption = newElement('option', { value: operator, innerText: operator });
        addElement(operatorOption, operatorSelector);
    }
    const valueInput = newElement('input', { class: ["filterValue"] });
    const caseSensitivityCheckbox = newElement('input', { type: "checkbox", title: "Case Sensitive", class: ["filterCaseSensitivity"] });
    const addButton = newElement('button', { innerText: "+", title: "Add Filter" });
    registerElement(addButton, 'click', () => {
        const newFilter = createWhereClauseUI(parentElement);
        addElement(newFilter, parentElement, "beforeend");
    })
    const removeButton = newElement('button', { innerText: "x", title: "Remove Filter" });
    registerElement(removeButton, 'click', () => {
        if (qsa(".whereContainer", parentElement).length <= 1) {
            return
        }
        whereContainer.remove()
    })

    addElements([levelSelector, fieldSelector, operatorSelector, valueInput, caseSensitivityCheckbox, removeButton, addButton], whereContainer);
    return whereContainer;
}

function contains(fieldValue, filterValue, caseSensitive) {
    if (!caseSensitive) {
        fieldValue = fieldValue.toLowerCase();
        filterValue = filterValue.toLowerCase();
    }
    return fieldValue.indexOf(filterValue) >= 0;
}
function matches(fieldValue, filterValue, caseSensitive) {
    if (!caseSensitive) {
        fieldValue = fieldValue.toLowerCase();
        filterValue = filterValue.toLowerCase();
    }
    return fieldValue === filterValue;
}

function hasValue(fieldValue) {
    return fieldValue !== "";
}

function parseFilters(filterContainer) {
    const filters = [];
    const whereContainers = qsa(".whereContainer", filterContainer);
    for (let whereContainer of whereContainers) {
        filters.push(parseFilter(whereContainer));
    }
    return filters;
}

function parseFilter(whereContainer) {
    return filter = { 
        level: qs(".filterLevel", whereContainer).value, 
        value: qs(".filterValue", whereContainer).value, 
        path: qs(".filterPath", whereContainer).value, 
        operator: qs(".filterPath", whereContainer).selectedOptions[0].dataset.mappingName, 
        caseSensitive: qs(".filterOperator", whereContainer).value, 
        mapping: qs(".filterCaseSensitivity", whereContainer).checked
    }
}

function filterConversation(fullConversationInfo, filters) {
    for (let filter of filters) {
        let filterResult = false;
        for (let item of fullConversationInfo[filter.level.toLowerCase()]) {
            filterResult = filterItem(item, filter);
            if (filterResult === true) break;
        }
        if (filterResult === false) return false;
    }
    return true;
}

function filterItem(item, filter) {
    const fieldValue = addIfProperty(item, filter.path, "", filter.mapping);
    let result = false;
    switch (filter.operator) {
        case "matches":
            result = matches(fieldValue, filter.value, filter.caseSensitive);
            break;
        case "doesn't match":
            result = !matches(fieldValue, filter.value, filter.caseSensitive);
            break;
        case "contains":
            result = contains(fieldValue, filter.value, filter.caseSensitive);
            break;
        case "doesn't contain":
            result = !contains(fieldValue, filter.value, filter.caseSensitive);
            break;
        case "has value":
            result = hasValue(fieldValue);
            break;
        case "has no value":
            result = !hasValue(fieldValue);
            break;
        default:
            console.log(`Unknown Operator: ${filter.operator}`);
            break;
    }
    return result;
}

// figure out what it takes to get to metrics that I want
// then figure out how to abstract that out so it's configurable
// but start with hardcoding just to see

// metrics:
// ASA//AASA
// ACT
// Average Time Spent in a Specific Bot Flow
// Where an interaction was when it was ended (in queue, with an agent, in a bot, in a flow)

// first - with a set of where clauses
// previous - with a set of where clauses
// immediatelyPrevious - with a set of where clauses

function random(interaction) {
    // equivalent of FirstAssignmentTime - Started
    let timeInQueue = 0;
    let firstAcdParticipantStartTime = "";
    for (let participant of interaction.participants) {
        let didAgentAnswer = false;

        if (participant.purpose === 'agent' || participant.purpose === 'acd') {
            for (let session of participant.sessions) {
                for (let segment of session.segments) {
                    if (participant.purpose === "acd" && !firstAcdParticipantStartTime) {
                        firstAcdParticipantStartTime = segment.segmentStart;
                    }
                    else if (segment.segmentType === "interact") {
                        didAgentAnswer = true;
                        timeInQueue = timeDiff(segment.segmentStart, firstAcdParticipantStartTime)
                    }
                    if (firstAcdParticipantStartTime && didAgentAnswer) break;
                }
                if (firstAcdParticipantStartTime && didAgentAnswer) break;
            }
            if (firstAcdParticipantStartTime && didAgentAnswer) break;
        }
    }
    return timeInQueue;
}

function oldGetASA(interaction) {
    let firstAcdParticipantStartTime = "";
    let timeInQueue = undefined;
    for (let segment of interaction.allSegments) {
        if (segment.purpose === "acd" && !firstAcdParticipantStartTime) {
            firstAcdParticipantStartTime = segment.segmentStart;
        }
        if (segment.purpose === "agent" && segment.segmentType === "interact" && firstAcdParticipantStartTime) {
            timeInQueue = timeDiff(segment.segmentStart, firstAcdParticipantStartTime)
            break;
        }
    }
    return timeInQueue;
}

function getASA(interaction) {
    return timeDiff(interaction.firstAgentAnswer, interaction.firstAcdStart);
}

function getAverage(interactions) {
    let total = 0;
    let answeredCount = 0;
    for (let interaction of interactions) {
        const interactionSegments = getAllSegments(interaction);
        if (!interactionSegments.firstAcdStart || !interactionSegments.firstAgentAnswer) continue;
        total += getASA(interactionSegments);
        answeredCount++;
    }
    return {total: total, count: answeredCount, average: total / answeredCount, pretty: formattedForDisplay((total/answeredCount) / 1000)}
}

function getAllSegments(interaction) {
    const listOfSegments = [];
    let firstAcdStart;
    let firstAgentAnswer;
    for (let participant of interaction.participants) {
        for (let session of participant.sessions) {
            for (let segment of session.segments) {
                if (participant.purpose === "agent" && segment.segmentType === "interact" && !firstAgentAnswer) {
                    firstAgentAnswer = segment.segmentStart;
                }
                if (participant.purpose === "acd" && segment.segmentType === "interact" && !firstAcdStart) {
                    firstAcdStart = segment.segmentStart;
                }
                listOfSegments.push({...interaction, ...participant, ...session, ...segment})
            }
        }
    }
    listOfSegments.sort(sortBySegmentStart);
    return {conversationId: interaction.conversationId, firstAcdStart, firstAgentAnswer, allSegments: listOfSegments};
}

function sortBySegmentStart(a, b) {
    let aStart = new Date(a.segmentStart);
    let bStart = new Date(b.segmentStart);
    return aStart - bStart;
}

function firstOf(interactionSegments, filters) {
    for (let segment of interactionSegments) {
        if (filterItem(segment, filter)) {
            return segment;
        }
    }
}

const testConversation = JSON.parse('{"conversationEnd":"2024-04-09T20:16:54.144Z","conversationId":"e5958a27-27ac-4da5-83a5-7ecac4a2ff11","conversationInitiator":"agent","conversationStart":"2024-04-09T18:02:13.031Z","divisionIds":["235a0cf9-7d53-43e1-928e-520327a7e38f"],"originatingDirection":"inbound","participants":[{"externalContactId":"872ae5a3-32fa-4d86-9807-293c80acb757","participantId":"74954305-f4ae-490b-a96b-d3b025264f84","purpose":"customer","sessions":[{"addressFrom":"7b5e4bcc-dc74-4539-aeca-d1e6616cb589","addressTo":"b15b0736-c437-4efe-a6ca-6018f0c22fa7","direction":"inbound","journeyCustomerId":"8fdc3b06-31d1-404f-88e6-53b2ea00d529","journeyCustomerIdType":"cookie","journeyCustomerSessionId":"663aef20-f67c-11ee-ac5d-05242f83fbe2","journeyCustomerSessionIdType":"web","mediaType":"message","messageType":"webmessaging","peerId":"09373685-4ed3-40a7-87e1-b650525e6da7","provider":"PureCloud Messaging","requestedRoutings":["Standard"],"selectedAgentId":"7d92d64c-4b62-4c42-9faa-ef6d5d6456d1","sessionId":"dd754eed-0729-420f-934a-491b22cf4940","usedRouting":"Standard","metrics":[{"emitDate":"2024-04-09T18:02:13.031Z","name":"nConnected","value":1},{"emitDate":"2024-04-09T20:16:53.205Z","name":"tConnected","value":8080174}],"segments":[{"conference":false,"disconnectType":"peer","queueId":"e535e3d0-6c99-47e9-aa00-bf253e3b3aaa","segmentEnd":"2024-04-09T20:16:53.205Z","segmentStart":"2024-04-09T18:02:13.031Z","segmentType":"interact"}]}],"attributes":{"ACD End":"ANSWERED","Agent Answered":"True"}},{"participantId":"b41f0ade-34cd-4e9e-8e4f-5e9c6c3df8af","participantName":"Connor","purpose":"workflow","sessions":[{"addressFrom":"b15b0736-c437-4efe-a6ca-6018f0c22fa7","addressTo":"7b5e4bcc-dc74-4539-aeca-d1e6616cb589","direction":"inbound","mediaType":"message","messageType":"webmessaging","peerId":"dd754eed-0729-420f-934a-491b22cf4940","provider":"PureCloud Messaging","remote":"Guest","sessionId":"6682f1d8-4a46-4dbb-b8c3-fa9351d77a82","flow":{"endingLanguage":"en-us","entryReason":"b15b0736-c437-4efe-a6ca-6018f0c22fa7","entryType":"direct","exitReason":"TRANSFER","flowId":"c422793b-dc92-4a1b-b8d4-ebf7e51d4a6e","flowName":"Connor","flowType":"INBOUNDSHORTMESSAGE","flowVersion":"169.0","startingLanguage":"en-us","transferTargetAddress":"e535e3d0-6c99-47e9-aa00-bf253e3b3aaa","transferTargetName":"Connor Test","transferType":"ACD"},"metrics":[{"emitDate":"2024-04-09T18:02:13.036Z","name":"nFlow","value":1},{"emitDate":"2024-04-09T18:02:13.444Z","name":"tFlow","value":408},{"emitDate":"2024-04-09T18:02:13.444Z","name":"tFlowExit","value":408}],"segments":[{"conference":false,"disconnectType":"transfer","segmentEnd":"2024-04-09T18:02:13.444Z","segmentStart":"2024-04-09T18:02:13.036Z","segmentType":"interact"}]}]},{"participantId":"4319faff-f3c7-45de-a610-402b05d0ca82","participantName":"Connor Test","purpose":"acd","sessions":[{"addressFrom":"b15b0736-c437-4efe-a6ca-6018f0c22fa7","addressTo":"7b5e4bcc-dc74-4539-aeca-d1e6616cb589","direction":"inbound","flowInType":"workflow","mediaType":"message","messageType":"webmessaging","peerId":"dd754eed-0729-420f-934a-491b22cf4940","provider":"PureCloud Messaging","remote":"Guest","requestedRoutings":["Standard"],"selectedAgentId":"7d92d64c-4b62-4c42-9faa-ef6d5d6456d1","sessionId":"30f343a2-73c9-4bf0-b66d-90439f612dae","flow":{"flowId":"76259cf4-ceed-4988-8411-b6721438cbc2","flowName":"Connor Test","flowType":"INQUEUESHORTMESSAGE","flowVersion":"21.0","startingLanguage":"en-us"},"metrics":[{"emitDate":"2024-04-09T18:02:13.476Z","name":"nOffered","value":1},{"emitDate":"2024-04-09T18:02:16.564Z","name":"tAcd","value":3088}],"segments":[{"conference":false,"disconnectType":"transfer","queueId":"e535e3d0-6c99-47e9-aa00-bf253e3b3aaa","segmentEnd":"2024-04-09T18:02:16.564Z","segmentStart":"2024-04-09T18:02:13.476Z","segmentType":"interact"}]}]},{"participantId":"8c90be1b-db74-499f-b7ac-eae9a0f5d376","participantName":"Connor Test","purpose":"agent","teamId":"94a782ed-f1de-40c8-9ba0-5b809d96630e","userId":"7d92d64c-4b62-4c42-9faa-ef6d5d6456d1","sessions":[{"addressFrom":"b15b0736-c437-4efe-a6ca-6018f0c22fa7","addressTo":"7b5e4bcc-dc74-4539-aeca-d1e6616cb589","agentAssistantId":"a5bfa72a-b57e-430c-b506-80c3ab56677e","direction":"inbound","mediaType":"message","messageType":"webmessaging","peerId":"dd754eed-0729-420f-934a-491b22cf4940","provider":"PureCloud Messaging","remote":"Guest","requestedRoutings":["Standard"],"selectedAgentId":"7d92d64c-4b62-4c42-9faa-ef6d5d6456d1","sessionId":"a5048508-d1e4-4114-ad36-a90f92f431f4","usedRouting":"Standard","metrics":[{"emitDate":"2024-04-09T18:02:16.572Z","name":"tAlert","value":2907},{"emitDate":"2024-04-09T18:02:16.572Z","name":"tAnswered","value":3088},{"emitDate":"2024-04-09T18:02:37.616Z","name":"nBlindTransferred","value":1},{"emitDate":"2024-04-09T18:02:37.616Z","name":"nTransferred","value":1},{"emitDate":"2024-04-09T18:02:37.616Z","name":"tAgentResponseTime","value":24585},{"emitDate":"2024-04-09T18:02:37.616Z","name":"tTalk","value":21044},{"emitDate":"2024-04-09T18:02:37.616Z","name":"tTalkComplete","value":21044},{"emitDate":"2024-04-09T18:02:39.471Z","name":"tAcw","value":1855},{"emitDate":"2024-04-09T18:02:39.471Z","name":"tHandle","value":22899}],"segments":[{"conference":false,"queueId":"e535e3d0-6c99-47e9-aa00-bf253e3b3aaa","segmentEnd":"2024-04-09T18:02:16.572Z","segmentStart":"2024-04-09T18:02:13.665Z","segmentType":"alert"},{"conference":false,"disconnectType":"transfer","queueId":"e535e3d0-6c99-47e9-aa00-bf253e3b3aaa","segmentEnd":"2024-04-09T18:02:37.616Z","segmentStart":"2024-04-09T18:02:16.572Z","segmentType":"interact"},{"conference":false,"disconnectType":"transfer","queueId":"e535e3d0-6c99-47e9-aa00-bf253e3b3aaa","segmentEnd":"2024-04-09T18:02:39.471Z","segmentStart":"2024-04-09T18:02:37.616Z","segmentType":"wrapup"}]},{"addressFrom":"b15b0736-c437-4efe-a6ca-6018f0c22fa7","addressTo":"7b5e4bcc-dc74-4539-aeca-d1e6616cb589","agentAssistantId":"285a64bf-47e9-4dce-ba44-4235fb361ead","direction":"inbound","mediaType":"message","messageType":"webmessaging","peerId":"dd754eed-0729-420f-934a-491b22cf4940","provider":"PureCloud Messaging","remote":"Guest","requestedRoutings":["Standard"],"selectedAgentId":"7d92d64c-4b62-4c42-9faa-ef6d5d6456d1","sessionId":"d059d4a8-d6d1-45ae-8ea2-304c8bfb5a83","usedRouting":"Standard","metrics":[{"emitDate":"2024-04-09T18:02:39.645Z","name":"tAnswered","value":2014},{"emitDate":"2024-04-09T18:02:50.442Z","name":"nBlindTransferred","value":1},{"emitDate":"2024-04-09T18:02:50.442Z","name":"nTransferred","value":1},{"emitDate":"2024-04-09T18:02:50.442Z","name":"tTalk","value":10797},{"emitDate":"2024-04-09T18:02:50.442Z","name":"tTalkComplete","value":10797},{"emitDate":"2024-04-09T18:02:52.617Z","name":"tAcw","value":2175},{"emitDate":"2024-04-09T18:02:52.617Z","name":"tHandle","value":12972}],"segments":[{"conference":false,"disconnectType":"transfer","queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:02:50.442Z","segmentStart":"2024-04-09T18:02:39.645Z","segmentType":"interact"},{"conference":false,"disconnectType":"transfer","queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:02:52.617Z","segmentStart":"2024-04-09T18:02:50.442Z","segmentType":"wrapup"}]},{"addressFrom":"b15b0736-c437-4efe-a6ca-6018f0c22fa7","addressTo":"7b5e4bcc-dc74-4539-aeca-d1e6616cb589","agentAssistantId":"285a64bf-47e9-4dce-ba44-4235fb361ead","direction":"inbound","mediaType":"message","messageType":"webmessaging","peerId":"dd754eed-0729-420f-934a-491b22cf4940","provider":"PureCloud Messaging","remote":"Guest","requestedRoutings":["Standard"],"selectedAgentId":"7d92d64c-4b62-4c42-9faa-ef6d5d6456d1","sessionId":"30a2b76f-e498-41d1-a7cc-4d4e02d2e6f8","usedRouting":"Standard","metrics":[{"emitDate":"2024-04-09T18:02:52.762Z","name":"tAnswered","value":2275},{"emitDate":"2024-04-09T18:03:19.704Z","name":"nBlindTransferred","value":1},{"emitDate":"2024-04-09T18:03:19.704Z","name":"nTransferred","value":1},{"emitDate":"2024-04-09T18:03:19.704Z","name":"tTalk","value":26942},{"emitDate":"2024-04-09T18:03:19.704Z","name":"tTalkComplete","value":26942},{"emitDate":"2024-04-09T18:03:21.271Z","name":"tAcw","value":1567},{"emitDate":"2024-04-09T18:03:21.271Z","name":"tHandle","value":28509}],"segments":[{"conference":false,"disconnectType":"transfer","queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:03:19.704Z","segmentStart":"2024-04-09T18:02:52.762Z","segmentType":"interact"},{"conference":false,"disconnectType":"transfer","queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:03:21.271Z","segmentStart":"2024-04-09T18:03:19.704Z","segmentType":"wrapup"}]},{"addressFrom":"b15b0736-c437-4efe-a6ca-6018f0c22fa7","addressTo":"7b5e4bcc-dc74-4539-aeca-d1e6616cb589","agentAssistantId":"285a64bf-47e9-4dce-ba44-4235fb361ead","direction":"inbound","mediaType":"message","messageType":"webmessaging","peerId":"dd754eed-0729-420f-934a-491b22cf4940","provider":"PureCloud Messaging","remote":"Guest","requestedRoutings":["Standard"],"selectedAgentId":"7d92d64c-4b62-4c42-9faa-ef6d5d6456d1","sessionId":"e97df9de-4ddb-41ca-ad10-35206734458a","usedRouting":"Standard","metrics":[{"emitDate":"2024-04-09T18:03:24.605Z","name":"tAnswered","value":4837},{"emitDate":"2024-04-09T18:03:45.863Z","name":"nBlindTransferred","value":1},{"emitDate":"2024-04-09T18:03:45.863Z","name":"nTransferred","value":1},{"emitDate":"2024-04-09T18:03:45.863Z","name":"tTalk","value":21258},{"emitDate":"2024-04-09T18:03:45.863Z","name":"tTalkComplete","value":21258},{"emitDate":"2024-04-09T18:03:47.760Z","name":"tAcw","value":1897},{"emitDate":"2024-04-09T18:03:47.760Z","name":"tHandle","value":23155}],"segments":[{"conference":false,"disconnectType":"transfer","queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:03:45.863Z","segmentStart":"2024-04-09T18:03:24.605Z","segmentType":"interact"},{"conference":false,"disconnectType":"transfer","queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:03:47.760Z","segmentStart":"2024-04-09T18:03:45.863Z","segmentType":"wrapup"}]},{"addressFrom":"b15b0736-c437-4efe-a6ca-6018f0c22fa7","addressTo":"7b5e4bcc-dc74-4539-aeca-d1e6616cb589","agentAssistantId":"a5bfa72a-b57e-430c-b506-80c3ab56677e","direction":"inbound","mediaType":"message","messageType":"webmessaging","peerId":"dd754eed-0729-420f-934a-491b22cf4940","provider":"PureCloud Messaging","remote":"Guest","requestedRoutings":["Standard"],"selectedAgentId":"7d92d64c-4b62-4c42-9faa-ef6d5d6456d1","sessionId":"72dcfa7e-10ba-4d3a-b119-f69767a8969a","usedRouting":"Standard","metrics":[{"emitDate":"2024-04-09T18:03:53.100Z","name":"tAlert","value":2722},{"emitDate":"2024-04-09T18:03:53.100Z","name":"tAnswered","value":7179},{"emitDate":"2024-04-09T18:05:02.821Z","name":"nBlindTransferred","value":1},{"emitDate":"2024-04-09T18:05:02.821Z","name":"nTransferred","value":1},{"emitDate":"2024-04-09T18:05:02.821Z","name":"tTalk","value":69721},{"emitDate":"2024-04-09T18:05:02.821Z","name":"tTalkComplete","value":69721},{"emitDate":"2024-04-09T18:05:05.835Z","name":"tAcw","value":3014},{"emitDate":"2024-04-09T18:05:05.835Z","name":"tHandle","value":72735}],"segments":[{"conference":false,"queueId":"e535e3d0-6c99-47e9-aa00-bf253e3b3aaa","segmentEnd":"2024-04-09T18:03:53.100Z","segmentStart":"2024-04-09T18:03:50.378Z","segmentType":"alert"},{"conference":false,"disconnectType":"transfer","queueId":"e535e3d0-6c99-47e9-aa00-bf253e3b3aaa","segmentEnd":"2024-04-09T18:05:02.821Z","segmentStart":"2024-04-09T18:03:53.100Z","segmentType":"interact"},{"conference":false,"disconnectType":"transfer","queueId":"e535e3d0-6c99-47e9-aa00-bf253e3b3aaa","segmentEnd":"2024-04-09T18:05:05.835Z","segmentStart":"2024-04-09T18:05:02.821Z","segmentType":"wrapup"}]},{"addressFrom":"b15b0736-c437-4efe-a6ca-6018f0c22fa7","addressTo":"7b5e4bcc-dc74-4539-aeca-d1e6616cb589","agentAssistantId":"285a64bf-47e9-4dce-ba44-4235fb361ead","direction":"inbound","mediaType":"message","messageType":"webmessaging","peerId":"dd754eed-0729-420f-934a-491b22cf4940","provider":"PureCloud Messaging","remote":"Guest","requestedRoutings":["Standard"],"selectedAgentId":"7d92d64c-4b62-4c42-9faa-ef6d5d6456d1","sessionId":"09373685-4ed3-40a7-87e1-b650525e6da7","usedRouting":"Standard","metrics":[{"emitDate":"2024-04-09T18:05:10.032Z","name":"tAnswered","value":7197},{"emitDate":"2024-04-09T18:05:12.399Z","name":"tTalk","value":2367},{"emitDate":"2024-04-09T18:05:18.392Z","name":"tHeld","value":5993},{"emitDate":"2024-04-09T18:06:22.044Z","name":"tTalk","value":63652},{"emitDate":"2024-04-09T18:08:19.976Z","name":"tHeld","value":117932},{"emitDate":"2024-04-09T18:14:13.200Z","name":"tTalk","value":353224},{"emitDate":"2024-04-09T18:14:31.973Z","name":"tHeld","value":18773},{"emitDate":"2024-04-09T18:14:45.537Z","name":"tTalk","value":13564},{"emitDate":"2024-04-09T18:20:17.768Z","name":"tHeld","value":332231},{"emitDate":"2024-04-09T18:21:23.101Z","name":"tTalk","value":65333},{"emitDate":"2024-04-09T18:22:01.520Z","name":"tHeld","value":38419},{"emitDate":"2024-04-09T18:23:11.948Z","name":"tTalk","value":70428},{"emitDate":"2024-04-09T18:23:27.159Z","name":"tHeld","value":15211},{"emitDate":"2024-04-09T18:25:44.883Z","name":"tTalk","value":137724},{"emitDate":"2024-04-09T18:26:37.716Z","name":"tHeld","value":52833},{"emitDate":"2024-04-09T18:30:07.096Z","name":"tTalk","value":209380},{"emitDate":"2024-04-09T18:30:21.359Z","name":"tHeld","value":14263},{"emitDate":"2024-04-09T18:30:29.239Z","name":"tTalk","value":7880},{"emitDate":"2024-04-09T18:30:33.163Z","name":"tHeld","value":3924},{"emitDate":"2024-04-09T18:31:59.072Z","name":"tTalk","value":85909},{"emitDate":"2024-04-09T18:32:14.592Z","name":"tHeld","value":15520},{"emitDate":"2024-04-09T18:34:21.647Z","name":"tTalk","value":127055},{"emitDate":"2024-04-09T19:16:33.519Z","name":"tHeld","value":2531872},{"emitDate":"2024-04-09T19:19:47.542Z","name":"tTalk","value":194023},{"emitDate":"2024-04-09T19:54:19.825Z","name":"tHeld","value":2072283},{"emitDate":"2024-04-09T19:54:33.029Z","name":"tTalk","value":13204},{"emitDate":"2024-04-09T20:01:36.798Z","name":"tHeld","value":423769},{"emitDate":"2024-04-09T20:11:47.862Z","name":"tTalk","value":611064},{"emitDate":"2024-04-09T20:12:42.140Z","name":"tHeld","value":54278},{"emitDate":"2024-04-09T20:13:08.663Z","name":"tTalk","value":26523},{"emitDate":"2024-04-09T20:13:21.021Z","name":"tHeld","value":12358},{"emitDate":"2024-04-09T20:14:24.368Z","name":"tTalk","value":63347},{"emitDate":"2024-04-09T20:14:43.661Z","name":"tHeld","value":19293},{"emitDate":"2024-04-09T20:14:45.112Z","name":"tTalk","value":1451},{"emitDate":"2024-04-09T20:14:51.153Z","name":"tHeld","value":6041},{"emitDate":"2024-04-09T20:15:09.402Z","name":"tTalk","value":18249},{"emitDate":"2024-04-09T20:15:40.402Z","name":"tHeld","value":31000},{"emitDate":"2024-04-09T20:16:17.207Z","name":"tTalk","value":36805},{"emitDate":"2024-04-09T20:16:24.452Z","name":"tHeld","value":7245},{"emitDate":"2024-04-09T20:16:26.524Z","name":"tTalk","value":2072},{"emitDate":"2024-04-09T20:16:52.255Z","name":"tHeld","value":25731},{"emitDate":"2024-04-09T20:16:53.190Z","name":"oMessageTurn","value":1},{"emitDate":"2024-04-09T20:16:53.190Z","name":"tHeldComplete","value":5798969},{"emitDate":"2024-04-09T20:16:53.190Z","name":"tTalk","value":935},{"emitDate":"2024-04-09T20:16:53.190Z","name":"tTalkComplete","value":2104189},{"emitDate":"2024-04-09T20:16:54.144Z","name":"tAcw","value":954},{"emitDate":"2024-04-09T20:16:54.144Z","name":"tHandle","value":7904112}],"segments":[{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:05:12.399Z","segmentStart":"2024-04-09T18:05:10.032Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:05:18.392Z","segmentStart":"2024-04-09T18:05:12.399Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:06:22.044Z","segmentStart":"2024-04-09T18:05:18.392Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:08:19.976Z","segmentStart":"2024-04-09T18:06:22.044Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:14:13.200Z","segmentStart":"2024-04-09T18:08:19.976Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:14:31.973Z","segmentStart":"2024-04-09T18:14:13.200Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:14:45.537Z","segmentStart":"2024-04-09T18:14:31.973Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:20:17.768Z","segmentStart":"2024-04-09T18:14:45.537Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:21:23.101Z","segmentStart":"2024-04-09T18:20:17.768Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:22:01.520Z","segmentStart":"2024-04-09T18:21:23.101Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:23:11.948Z","segmentStart":"2024-04-09T18:22:01.520Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:23:27.159Z","segmentStart":"2024-04-09T18:23:11.948Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:25:44.883Z","segmentStart":"2024-04-09T18:23:27.159Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:26:37.716Z","segmentStart":"2024-04-09T18:25:44.883Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:30:07.096Z","segmentStart":"2024-04-09T18:26:37.716Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:30:21.359Z","segmentStart":"2024-04-09T18:30:07.096Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:30:29.239Z","segmentStart":"2024-04-09T18:30:21.359Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:30:33.163Z","segmentStart":"2024-04-09T18:30:29.239Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:31:59.072Z","segmentStart":"2024-04-09T18:30:33.163Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:32:14.592Z","segmentStart":"2024-04-09T18:31:59.072Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:34:21.647Z","segmentStart":"2024-04-09T18:32:14.592Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T19:16:33.519Z","segmentStart":"2024-04-09T18:34:21.647Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T19:19:47.542Z","segmentStart":"2024-04-09T19:16:33.519Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T19:54:19.825Z","segmentStart":"2024-04-09T19:19:47.542Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T19:54:33.029Z","segmentStart":"2024-04-09T19:54:19.825Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:01:36.798Z","segmentStart":"2024-04-09T19:54:33.029Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:11:47.862Z","segmentStart":"2024-04-09T20:01:36.798Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:12:42.140Z","segmentStart":"2024-04-09T20:11:47.862Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:13:08.663Z","segmentStart":"2024-04-09T20:12:42.140Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:13:21.021Z","segmentStart":"2024-04-09T20:13:08.663Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:14:24.368Z","segmentStart":"2024-04-09T20:13:21.021Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:14:43.661Z","segmentStart":"2024-04-09T20:14:24.368Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:14:45.112Z","segmentStart":"2024-04-09T20:14:43.661Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:14:51.153Z","segmentStart":"2024-04-09T20:14:45.112Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:15:09.402Z","segmentStart":"2024-04-09T20:14:51.153Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:15:40.402Z","segmentStart":"2024-04-09T20:15:09.402Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:16:17.207Z","segmentStart":"2024-04-09T20:15:40.402Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:16:24.452Z","segmentStart":"2024-04-09T20:16:17.207Z","segmentType":"hold"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:16:26.524Z","segmentStart":"2024-04-09T20:16:24.452Z","segmentType":"interact"},{"conference":false,"queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:16:52.255Z","segmentStart":"2024-04-09T20:16:26.524Z","segmentType":"hold"},{"conference":false,"disconnectType":"client","queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:16:53.190Z","segmentStart":"2024-04-09T20:16:52.255Z","segmentType":"interact"},{"conference":false,"disconnectType":"client","queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T20:16:54.144Z","segmentStart":"2024-04-09T20:16:53.190Z","segmentType":"wrapup"}]}]},{"participantId":"efdff6c7-ee8f-4831-b928-450eaed31a35","participantName":"Connor Test 2","purpose":"acd","sessions":[{"addressFrom":"b15b0736-c437-4efe-a6ca-6018f0c22fa7","addressTo":"7b5e4bcc-dc74-4539-aeca-d1e6616cb589","direction":"inbound","flowInType":"agent","mediaType":"message","messageType":"webmessaging","peerId":"dd754eed-0729-420f-934a-491b22cf4940","provider":"PureCloud Messaging","remote":"Guest","requestedRoutings":["Standard"],"selectedAgentId":"7d92d64c-4b62-4c42-9faa-ef6d5d6456d1","sessionId":"d507cefd-e147-4083-ad29-b00470556d5d","usedRouting":"Standard","metrics":[{"emitDate":"2024-04-09T18:02:37.644Z","name":"nOffered","value":1},{"emitDate":"2024-04-09T18:02:39.658Z","name":"tAcd","value":2014}],"segments":[{"conference":false,"disconnectType":"transfer","queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:02:39.658Z","segmentStart":"2024-04-09T18:02:37.644Z","segmentType":"interact"}]}]},{"participantId":"4dfa6e28-c7ee-42b0-a946-002f867f5308","participantName":"Connor Test 2","purpose":"acd","sessions":[{"addressFrom":"b15b0736-c437-4efe-a6ca-6018f0c22fa7","addressTo":"7b5e4bcc-dc74-4539-aeca-d1e6616cb589","direction":"inbound","flowInType":"agent","mediaType":"message","messageType":"webmessaging","peerId":"dd754eed-0729-420f-934a-491b22cf4940","provider":"PureCloud Messaging","remote":"Guest","requestedRoutings":["Standard"],"selectedAgentId":"7d92d64c-4b62-4c42-9faa-ef6d5d6456d1","sessionId":"8c48ddcb-89be-4bff-9acf-3bb49eeafef9","usedRouting":"Standard","metrics":[{"emitDate":"2024-04-09T18:02:50.500Z","name":"nOffered","value":1},{"emitDate":"2024-04-09T18:02:52.775Z","name":"tAcd","value":2275}],"segments":[{"conference":false,"disconnectType":"transfer","queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:02:52.775Z","segmentStart":"2024-04-09T18:02:50.500Z","segmentType":"interact"}]}]},{"participantId":"cf274c51-7f3f-45de-af9d-bccaf5bd2c08","participantName":"Connor Test 2","purpose":"acd","sessions":[{"addressFrom":"b15b0736-c437-4efe-a6ca-6018f0c22fa7","addressTo":"7b5e4bcc-dc74-4539-aeca-d1e6616cb589","direction":"inbound","flowInType":"agent","mediaType":"message","messageType":"webmessaging","peerId":"dd754eed-0729-420f-934a-491b22cf4940","provider":"PureCloud Messaging","remote":"Guest","requestedRoutings":["Standard"],"selectedAgentId":"7d92d64c-4b62-4c42-9faa-ef6d5d6456d1","sessionId":"b185229a-5440-47c6-9bf3-92ae4d47d64c","usedRouting":"Standard","metrics":[{"emitDate":"2024-04-09T18:03:19.771Z","name":"nOffered","value":1},{"emitDate":"2024-04-09T18:03:24.608Z","name":"tAcd","value":4837}],"segments":[{"conference":false,"disconnectType":"transfer","queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:03:24.608Z","segmentStart":"2024-04-09T18:03:19.771Z","segmentType":"interact"}]}]},{"participantId":"e758789d-022c-48b1-8a6f-d38dcca5fe5c","participantName":"Connor Test","purpose":"acd","sessions":[{"addressFrom":"b15b0736-c437-4efe-a6ca-6018f0c22fa7","addressTo":"7b5e4bcc-dc74-4539-aeca-d1e6616cb589","direction":"inbound","flowInType":"agent","mediaType":"message","messageType":"webmessaging","peerId":"dd754eed-0729-420f-934a-491b22cf4940","provider":"PureCloud Messaging","remote":"Guest","requestedRoutings":["Standard"],"selectedAgentId":"7d92d64c-4b62-4c42-9faa-ef6d5d6456d1","sessionId":"06597fb5-6cbb-4683-9a64-38fff7f7253d","flow":{"flowId":"76259cf4-ceed-4988-8411-b6721438cbc2","flowName":"Connor Test","flowType":"INQUEUESHORTMESSAGE","flowVersion":"21.0","startingLanguage":"en-us"},"metrics":[{"emitDate":"2024-04-09T18:03:45.909Z","name":"nOffered","value":1},{"emitDate":"2024-04-09T18:03:53.088Z","name":"tAcd","value":7179}],"segments":[{"conference":false,"disconnectType":"transfer","queueId":"e535e3d0-6c99-47e9-aa00-bf253e3b3aaa","segmentEnd":"2024-04-09T18:03:53.088Z","segmentStart":"2024-04-09T18:03:45.909Z","segmentType":"interact"}]}]},{"participantId":"474047d6-d672-423c-bbce-e96669a10241","participantName":"Connor Test 2","purpose":"acd","sessions":[{"addressFrom":"b15b0736-c437-4efe-a6ca-6018f0c22fa7","addressTo":"7b5e4bcc-dc74-4539-aeca-d1e6616cb589","direction":"inbound","flowInType":"agent","mediaType":"message","messageType":"webmessaging","peerId":"dd754eed-0729-420f-934a-491b22cf4940","provider":"PureCloud Messaging","remote":"Guest","requestedRoutings":["Standard"],"selectedAgentId":"7d92d64c-4b62-4c42-9faa-ef6d5d6456d1","sessionId":"8aac3ca5-d3b0-4076-8b38-3267431bfa52","usedRouting":"Standard","metrics":[{"emitDate":"2024-04-09T18:05:02.856Z","name":"nOffered","value":1},{"emitDate":"2024-04-09T18:05:10.053Z","name":"tAcd","value":7197}],"segments":[{"conference":false,"disconnectType":"transfer","queueId":"12fbfc3f-8660-44ca-962b-0e1b3e5f9009","segmentEnd":"2024-04-09T18:05:10.053Z","segmentStart":"2024-04-09T18:05:02.856Z","segmentType":"interact"}]}]}]}')