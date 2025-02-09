window.levels = ["conversation", "participant", "session", "segment"];
window.fields = {
    // usersMapping, queueMapping, wrapupCodeMapping, divisionMapping, knowledgeBaseMapping
    "Conversation": [
        { name: "Conference Start", path: "conferenceStart", level: "interaction" },
        { name: "Conversation End", path: "conversationEnd", level: "interaction" },
        { name: "Conversation ID", path: "conversationId", level: "interaction" },
        { name: "Conversation Initiator", path: "conversationInitator", level: "interaction" },
        { name: "Conversation Start", path: "conversationStart", level: "interaction" },
        { name: "Customer Participation", path: "customerParticipation", level: "interaction" },
        { name: "Division IDs", path: "divisionIds", level: "interaction", mapping: "divisionMapping" },
        { name: "External Tag", path: "externalTag", level: "interaction" },
        { name: "Knowledge Base IDs", path: "knowledgeBaseIds", level: "interaction", mapping: "knowledgeBaseMapping" },
        { name: "Min Conversation MOS", path: "mediaStatsMinConversationMos", level: "interaction" },
        { name: "Min Conversation R Factor", path: "mediaStatsMinConversationRFactor", level: "interaction" },
        { name: "Originating Direction", path: "originatingDirection", level: "interaction" },
        { name: "Self Served", path: "selfServed", level: "interaction" },

        { name: "Evaluations", path: "evaluations", level: "interaction" },
        { name: "Evaluation Assignees Applicable", path: "evaluations.assigneeApplicable", level: "interaction" },
        { name: "Evaluation Assignee IDs", path: "evaluations.assigneeId", level: "interaction", mapping: "usersMapping" },
        { name: "Evaluation Calibration IDs", path: "evaluations.calibrationId", level: "interaction" },
        { name: "Evaluation Context IDs", path: "evaluations.contextId", level: "interaction" },
        { name: "Evaluation Deleted", path: "evaluations.deleted", level: "interaction" },
        { name: "Evaluation IDs", path: "evaluations.evaluationId", level: "interaction" },
        { name: "Evaluation Statuses", path: "evaluations.evaluationStatus", level: "interaction" },
        { name: "Evaluation Evaluator IDs", path: "evaluations.evaluatorId", level: "interaction", mapping: "usersMapping" },
        { name: "Evaluation Event Times", path: "evaluations.eventTime", level: "interaction" },
        { name: "Evaluation Form IDs", path: "evaluations.formId", level: "interaction" },
        { name: "Evaluation Form Names", path: "evaluations.formName", level: "interaction" },
        { name: "Evaluation Queue IDs", path: "evaluations.queueId", level: "interaction", mapping: "queueMapping" },
        { name: "Evaluation Released", path: "evaluations.released", level: "interaction" },
        { name: "Evaluation Rescored", path: "evaluations.rescored", level: "interaction" },
        { name: "Evaluation User IDs", path: "evaluations.userId", level: "interaction", mapping: "usersMapping" },
        { name: "Evaluation Total Critical Scores", path: "evaluations.oTotalCriticalScore", level: "interaction" },
        { name: "Evaluation Total Scores", path: "evaluations.oTotalScore", level: "interaction" },

        { name: "Surveys", path: "surveys", level: "interaction" },
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

        { name: "Resolutions", path: "resolutions", level: "interaction" },
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
        { name: "Active Skill IDs", path: "activeSkillIds", level: "session" },
        { name: "ACW Skipped", path: "acwSkipped", level: "session" },
        { name: "Address From", path: "addressFrom", level: "session" },
        { name: "Address Other", path: "addressOther", level: "session" },
        { name: "Address Self", path: "addressSelf", level: "session" },
        { name: "Address To", path: "addressTo", level: "session" },
        { name: "Agent Assistant ID", path: "agentAssistantId", level: "session" },
        { name: "Agent Bullseye Ring", path: "agentBulleyeRing", level: "session" },
        { name: "Agent Owned", path: "agentOwned", level: "session" },
        { name: "ANI", path: "ani", level: "session" },
        { name: "Assigner ID", path: "assignerId", level: "session" },
        { name: "Authenticated", path: "authenticated", level: "session" },
        { name: "Barged Participant ID", path: "bargedParticipantId", level: "session" },
        { name: "BCC", path: "bcc", level: "session" },
        { name: "Callback Numbers", path: "callbackNumbers", level: "session" },
        { name: "Callback Scheduled Time", path: "callbackScheduledTime", level: "session" },
        { name: "Callback User Name", path: "callbackUserName", level: "session" },
        { name: "CC", path: "cc", level: "session" },
        { name: "Cleared", path: "cleared", level: "session" },
        { name: "Coached Participant ID", path: "coachedParticipantId", level: "session" },
        { name: "Cobrowse Role", path: "cobrowseRole", level: "session" },
        { name: "Cobrowse Room ID", path: "cobrowseRoomId", level: "session" },
        { name: "Delivery Status", path: "deliveryStatus", level: "session" },
        { name: "Delivery Status Changed Date", path: "deliveryStatusChangeDate", level: "session" },
        { name: "Destination Addresses", path: "destinationAddresses", level: "session" },
        { name: "Direction", path: "direction", level: "session" },
        { name: "Dispostion Analyzer", path: "dispositionAnalyzer", level: "session" },
        { name: "Disposition Name", path: "dispositionName", level: "session" },
        { name: "DNIS", path: "dnis", level: "session" },
        { name: "Edge ID", path: "edgeId", level: "session" },
        { name: "Eligible Agent Counts", path: "eligibleAgentCounts", level: "session" },
        { name: "Extended Delivery Status", path: "extendedDeliveryStatus", level: "session" },
        { name: "Flow In Type", path: "flowInType", level: "session" },
        { name: "Flow Out Type", path: "flowOutType", level: "session" },
        { name: "Journey Action ID", path: "journeyActionId", level: "session" },
        { name: "Journey Action Map ID", path: "journeyActionMapId", level: "session" },
        { name: "Journey Action Map Version", path: "journeyActionMapVersion", level: "session" },
        { name: "Journey Customer ID", path: "journeyCustomerId", level: "session" },
        { name: "Journey Customer ID Type", path: "journeyCustomerIdType", level: "session" },
        { name: "Journey Customer Session ID", path: "journeyCustomerSessionId", level: "session" },
        { name: "Journey Customer Session ID Type", path: "journeyCustomerSessionIdType", level: "session" },
        { name: "Media Bridge ID", path: "mediaBridgeId", level: "session" },
        { name: "Media Count", path: "mediaCount", level: "session" },
        { name: "Media Type", path: "mediaType", level: "session" },
        { name: "Message Type", path: "messageType", level: "session" },
        { name: "Monitored Participant ID", path: "monitoredParticipantId", level: "session" },
        { name: "Outbount Campaign ID", path: "outboundCampaignId", level: "session" },
        { name: "Outbount Contact ID", path: "outboundContactId", level: "session" },
        { name: "Outbount Contact List ID", path: "outboundContactListId", level: "session" },
        { name: "Peer ID", path: "peerId", level: "session" },
        { name: "Protocol Call ID", path: "protocolCallId", level: "session" },
        { name: "Provider", path: "provider", level: "session" },
        { name: "Recording", path: "recording", level: "session" },
        { name: "Remote", path: "remote", level: "session" },
        { name: "Remote Name Displayable", path: "remoteNameDisplayable", level: "session" },
        { name: "Removed Skill IDs", path: "removedSkillIds", level: "session" },
        { name: "Requested Routings", path: "requestedRoutings", level: "session" },
        { name: "Room ID", path: "roomId", level: "session" },
        { name: "Routing Ring", path: "routingRing", level: "session" },
        { name: "Routing Rule", path: "routingRule", level: "session" },
        { name: "Routing Rule Type", path: "routingRuleType", level: "session" },
        { name: "Screen Share Address Self", path: "screenShareAddressSelf", level: "session" },
        { name: "Screen Share Room ID", path: "screenShareRoomId", level: "session" },
        { name: "Script ID", path: "scriptId", level: "session" },
        { name: "Selected Agent ID", path: "selectedAgentId", level: "session", mapping: "usersMapping" },
        { name: "Selected Agent Rank", path: "selectedAgentRank", level: "session" },
        { name: "Session DNIS", path: "sessionDnis", level: "session" },
        { name: "Session ID", path: "sessionId", level: "session" },
        { name: "Sharing Screen", path: "sharingScreen", level: "session" },
        { name: "Skip Enabled", path: "skipEnabled", level: "session" },
        { name: "Timeout Seconds", path: "timeoutSeconds", level: "session" },
        { name: "Used Routing", path: "usedRouting", level: "session" },
        { name: "Video Address Self", path: "videoAddressSelf", level: "session" },
        { name: "Video Room ID", path: "videoRoomId", level: "session" },
        { name: "Waiting Interaction Counts", path: "waitingInteractionCounts", level: "session" },

        { name: "Agent Groups", path: "agentGroups", level: "session" },
        { name: "Agent Group IDs", path: "agentGroups.agentGroupId", level: "session" },
        { name: "Agent Group Types", path: "agentGroups.agentGroupType", level: "session" },
        
        { name: "Proposed Agents", path: "proposedAgents", level: "session" },
        { name: "Proposed Agent Ranks", path: "proposedAgents.agentRank", level: "session" },
        { name: "Proposed Agent IDs", path: "proposedAgents.proposedAgentId", level: "session", mapping: "usersMapping" },

        { name: "Media Endpoint Stats", path: "mediaEndpointStats", level: "session" },
        { name: "Media Endpoint Stat Codecs", path: "mediaEndpointStats.codecs", level: "session" },
        { name: "Media Endpoint Stat Discarded Packets", path: "mediaEndpointStats.discardedPackets", level: "session" },
        { name: "Media Endpoint Stat Duplicate Packets", path: "mediaEndpointStats.duplicatePackets", level: "session" },
        { name: "Media Endpoint Stat Event Times", path: "mediaEndpointStats.eventTime", level: "session" },
        { name: "Media Endpoint Stat Invalid Packets", path: "mediaEndpointStats.invalidPackets", level: "session" },
        { name: "Media Endpoint Stat Max Latencies MS", path: "mediaEndpointStats.maxLatencyMs", level: "session" },
        { name: "Media Endpoint Stat Min MOS", path: "mediaEndpointStats.minMos", level: "session" },
        { name: "Media Endpoint Stat Min R Factors", path: "mediaEndpointStats.minRFactor", level: "session" },
        { name: "Media Endpoint Stat Overrun Packets", path: "mediaEndpointStats.overrunPackets", level: "session" },
        { name: "Media Endpoint Stat Received Packets", path: "mediaEndpointStats.receivedPackets", level: "session" },
        { name: "Media Endpoint Stat Underrun Packets", path: "mediaEndpointStats.underrunPackets", level: "session" },

        { name: "Flow", path: "flow", level: "session" },
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

        { name: "Metrics", path: "metrics", level: "session" },
        { name: "Metric Emit Dates", path: "metrics.emitDate", level: "session" },
        { name: "Metric Names", path: "metrics.name", level: "session" },
        { name: "Metric Values", path: "metrics.value", level: "session" },
    ],
    "Segment": [
        { name: "Audio Muted", path: "audioMuted", level: "segment" },
        { name: "Conference", path: "conference", level: "segment" },
        { name: "Destination Conversation ID", path: "destinationConversationId", level: "segment" },
        { name: "Destination Session ID", path: "destinationSessionId", level: "segment" },
        { name: "Disconnect Type", path: "disconnectType", level: "segment" },
        { name: "Error Code", path: "errorCode", level: "segment" },
        { name: "Group ID", path: "groupId", level: "segment" },
        { name: "Q.850 Response Codes", path: "q850ResponseCodes", level: "segment" },
        { name: "Queue ID", path: "queueId", level: "segment", mapping: "queueMapping" },
        { name: "Requested Language ID", path: "requestedLanguageId", level: "segment" },
        { name: "Requested Routing Skill IDs", path: "requestedRoutingSkillIds", level: "segment" },
        { name: "Requested Routing User IDs", path: "requestedRoutingUserIds", level: "segment" },
        { name: "Segment End", path: "segmentEnd", level: "segment" },
        { name: "Segment Start", path: "segmentStart", level: "segment" },
        { name: "Segment Type", path: "segmentType", level: "segment" },
        { name: "SIP Response Codes", path: "sipResponseCodes", level: "segment" },
        { name: "Source Conversation IDs", path: "sourceConversationId", level: "segment" },
        { name: "Source Session ID", path: "sourceSessionId", level: "segment" },
        { name: "Subject", path: "subject", level: "segment" },
        { name: "Video Muted", path: "videoMuted", level: "segment" },
        { name: "Wrap-Up Code", path: "wrapUpCode", level: "segment", mapping: "wrapupCodeMapping" },
        { name: "Wrap-Up Notes", path: "wrapUpNote", level: "segment" },
        { name: "Wrap-Up Tags", path: "wrapUpTags", level: "segment" },

        { name: "Scored Agents", path: "scoredAgents", level: "segment" },
        { name: "Scored Agent Scores", path: "scoredAgents.agentScore", level: "segment" },
        { name: "Scored Agent IDs", path: "scoredAgents.scoredAgentId", level: "segment", mapping: "usersMapping" },

        { name: "Properties", path: "properties", level: "segment" },
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
    await await pollStatus(makeGenesysRequest, [`/api/v2/analytics/conversations/details/jobs/${newJob.jobId}`], "state", ["FULFILLED"], ["FAILED"], 2000);

    // Is your job still running? Did it fail? Has it successfully completed gathering all of your data? 
    // Depending on load and the volume of data being queried, it might be on the order of seconds to minutes before you see your job complete.
    // If and only if your job has successfully completed, is it time for you to retrieve the results. 
    // At this point, you can ask for the first page of data back 
    // (HTTP GET /api/v2/analytics/conversations/details/jobs/{jobId}/results). 
    const results = await getJobResults(newJob.jobId);

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
    return makeGenesysRequest(`/api/v2/analytics/conversations/details/jobs`, "POST", body);
}

async function getJobResults(jobId) {
    return getAllCursoredGenesysItems(`/api/v2/analytics/conversations/details/jobs/${jobId}/results`, 100, "conversations");
}

async function getBotTurns(botFlowId, start, end) {
    return makeGenesysRequest(`/api/v2/analytics/botflows/${botFlowId}/reportingturns?interval=${start}/${end}`);
}

async function getRecording(conversationId) {
    return makeGenesysRequest(`/api/v2/conversations/${conversationId}/recordings`);
}

function botParticipant(participant, conversationId) {
    for (let session of participant.sessions) {
        const botName = session.flow.flowName;

        if (!botStats.exitReasons.hasOwnProperty(session.flow.exitReason)) botStats.exitReasons[session.flow.exitReason] = [];
        botStats.exitReasons[session.flow.exitReason].push({ botName: botName, conversationId: conversationId });
        for (let segment of session.segments) {
            addFlowTimes(botStats, "timeInFlow", "maxTimeInFlow", "averageTimeInFlow", segment, { botName: botName, conversationId: conversationId });
        }
    }
}

function acdParticipant(participant, conversationId) {
    for (let session of participant.sessions) {
        for (let segment of session.segments) {
            if (!queueStats.disconnectTypes.hasOwnProperty(segment.disconnectType)) queueStats.disconnectTypes[segment.disconnectType] = [];
            switch (segment.disconnectType) {
                case "peer":
                    // customer disconnect
                    queueStats.disconnectTypes[segment.disconnectType].push({ conversationId: conversationId });
                    break;
                case "transfer":
                    // went to agent? or another queue?
                    queueStats.disconnectTypes[segment.disconnectType].push({ conversationId: conversationId, agent: usersMapping.hasOwnProperty(session.selectedAgentId) ? usersMapping[session.selectedAgentId] : session.selectedAgentId });
                    break;
                case "client":
                    queueStats.disconnectTypes[segment.disconnectType].push({ conversationId: conversationId, flowName: session.flow.flowName });
                    break;
                default:
                    console.log(conversationId, segment.disconnectType);
                    break;
            }

            addFlowTimes(queueStats, "queueTime", "maxQueueTime", "averageQueueTime", segment, { queue: queueMapping.hasOwnProperty(segment.queueId) ? queueMapping[segment.queueId] : segment.queueId, conversationId: conversationId });
        }
    }
}

function agentParticipant(participant, conversationId) {
    for (let session of participant.sessions) {
        switch (session.mediaType) {
            case "message": {
                for (let segment of session.segments) {
                    switch (segment.segmentType) {
                        case "alert":
                            addFlowTimes(agentStats, "alertTimes", "maxAlertTime", "averageAlertTime", segment, { conversationId: conversationId, agent: usersMapping.hasOwnProperty(session.selectedAgentId) ? usersMapping[session.selectedAgentId] : session.selectedAgentId });
                            break;
                        case "interact":
                            addFlowTimes(agentStats, "interactTimes", "maxInteractTime", "averageInteractTime", segment, { conversationId: conversationId, agent: usersMapping.hasOwnProperty(session.selectedAgentId) ? usersMapping[session.selectedAgentId] : session.selectedAgentId });
                            break;
                        case "wrapup":
                            addFlowTimes(agentStats, "wrapupTimes", "maxWrapupTime", "averageWrapupTime", segment, { conversationId: conversationId, agent: usersMapping.hasOwnProperty(session.selectedAgentId) ? usersMapping[session.selectedAgentId] : session.selectedAgentId });
                            break;
                        case "hold":
                            addFlowTimes(agentStats, "holdTimes", "maxHoldTime", "averageHoldTime", segment, { conversationId: conversationId, agent: usersMapping.hasOwnProperty(session.selectedAgentId) ? usersMapping[session.selectedAgentId] : session.selectedAgentId });
                            break;
                        default:
                            console.log(conversationId, segment.segmentType, segment);
                            break;
                    }
                }
                break;
            }
            case "cobrowse": {
                for (let segment of session.segments) {
                    addFlowTimes(agentStats, "cobrowseTimes", "maxCobrowseTime", "averageCobrowseTime", segment, { conversationId: conversationId, agent: usersMapping.hasOwnProperty(session.selectedAgentId) ? usersMapping[session.selectedAgentId] : session.selectedAgentId, cobrowseRole: session.cobrowseRole });
                }
                break;
            }
            default:
                console.log(conversationId, session.mediaType, session);
                break;
        }
    }
}

function workflowParticipant(participant, conversationId) {
    for (let session of participant.sessions) {
        const flowExitReason = session.flow.exitReason ? session.flow.exitReason : "Unknown"
        if (!workflowStats.disconnectTypes.hasOwnProperty(flowExitReason)) workflowStats.disconnectTypes[flowExitReason] = [];
        workflowStats.disconnectTypes[flowExitReason].push({ conversationId: conversationId, flowName: session.flow.flowName });

        for (let segment of session.segments) {
            addFlowTimes(workflowStats, "flowTimes", "maxFlowTime", "averageFlowTime", segment, { conversationId: conversationId, flowName: session.flow.flowName });
        }
    }
}

function addFlowTimes(object, key, maxKey, averageKey, segment, fields) {
    if (!segment.segmentStart || !segment.segmentEnd) return;

    const duration = timeDiff(segment.segmentEnd, segment.segmentStart);
    const prettyDuration = formattedForDisplay(duration / 1000);

    // handle the average
    if (object[averageKey]) {
        const currentCount = object[averageKey].count !== undefined ? object[averageKey].count : 0;
        const currentTotal = object[averageKey].totalDuration !== undefined ? object[averageKey].totalDuration : 0;
        // increment the count
        object[averageKey].count = currentCount + 1;
        // add duration to durrent total
        object[averageKey].totalDuration = currentTotal + duration;
        // set the duration and pretty duration to the average
        object[averageKey].duration = Math.round(object[averageKey].totalDuration / object[averageKey].count);
        object[averageKey].prettyDuration = formattedForDisplay((Math.round(object[averageKey].totalDuration / object[averageKey].count) / 1000));
    }
    // handle the max value
    if (object[maxKey]) {
        const currentMax = object[maxKey].duration !== undefined ? object[maxKey].duration : 0;
        if (duration > currentMax) {
            object[maxKey].duration = duration;
            object[maxKey].prettyDuration = prettyDuration;
            object[maxKey] = { ...object[maxKey], ...fields };
        }
    }
    object[key].push({ ...fields, duration: duration, prettyDuration: prettyDuration })
}

function getConversationTurns(conversation) {
    for (let participant of conversation.participants) {
        switch (participant.purpose) {
            case "botflow":
                botParticipant(participant, conversation.conversationId);
                break;
            case "acd":
                acdParticipant(participant, conversation.conversationId);
                break;
            case "agent":
                agentParticipant(participant, conversation.conversationId);
                break;
            case "workflow":
                workflowParticipant(participant, conversation.conversationId);
                break;
            case "customer":
                break;
            default:
                console.log(conversation.conversationId, participant.purpose, participant);
                break;
        }
    }
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
                    if (window[mapping]) {
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
                    if (window[mapping]) {
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
            if (window[mapping]) {
                return window[mapping].hasOwnProperty(currentPiece[part]) ? window[mapping][currentPiece[part]] : currentPiece[part];
            }
            return currentPiece[part]
        }
    }
    return orValue ? orValue : "";
}

function getAllConversationSegments(interaction, fieldsInfo, dataLevel) {
    const dataRows = [];
    const level = dataLevel.toLowerCase();
    const dataLevelIndex = levels.indexOf(level);
    const currentItems = {
        conversation: interaction,
        participant: undefined,
        session: undefined,
        segment: undefined
    }
    if (dataLevel === "Conversation") {
        dataRows.push(createDataRow(fieldsInfo, dataLevelIndex, currentItems));
    }
    else {
        for (let participant of interaction.participants) {
            currentItems.participant = participant;
            if (dataLevel === "Participant") {
                dataRows.push(createDataRow(fieldsInfo, dataLevelIndex, currentItems));
            }
            else {
                for (let session of participant.sessions) {
                    currentItems.session = session;
                    if (dataLevel === "Session") {
                        dataRows.push(createDataRow(fieldsInfo, dataLevelIndex, currentItems));
                    }
                    else {
                        for (let segment of session.segments) {
                            currentItems.segment = segment;
                            dataRows.push(createDataRow(fieldsInfo, dataLevelIndex, currentItems));
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
    window.agentStats = {
        averageAlertTime: {},
        maxAlertTime: {},
        alertTimes: [],
        averageInteractTime: {},
        maxInteractTime: {},
        interactTimes: [],
        averageWrapupTime: {},
        maxWrapupTime: {},
        wrapupTimes: [],
        averageHoldTime: {},
        maxHoldTime: {},
        holdTimes: [],
        averageCobrowseTime: {},
        maxCobrowseTime: {},
        cobrowseTimes: []
    };
    window.botStats = {
        exitReasons: {},
        averageTimeInFlow: {},
        maxTimeInFlow: {},
        timeInFlow: []
    };
    window.queueStats = {
        disconnectTypes: {},
        averageQueueTime: {},
        maxQueueTime: {},
        queueTime: []
    };
    window.workflowStats = {
        disconnectTypes: {},
        averageFlowTime: {},
        maxFlowTime: {},
        flowTimes: []
    }

    const start = eById("startDate").value;
    const end = eById("endDate").value;
    const dataLevel = eById("level").value;

    if (!start || !end) throw new Error("Need a start or end date");
    const conversationsCacheKey = btoa(encodeURIComponent(`${window.orgId}:${start}:${end}`));
    const orgInfoCacheKey = btoa(encodeURIComponent(window.orgId));

    const startDate = start + "T00:00:00.000Z";
    const endDate = end + "T23:59:59.999Z";

    if (window.orgInfoCacheKey !== orgInfoCacheKey) {
        const users = await getAllUsers();
        window.usersMapping = mapProperty("id", "name", users);
        const queues = await getAllGenesysItems("/api/v2/routing/queues?sortOrder=asc&sortBy=name&name=**&divisionId", 100, "entities");
        window.queueMapping = mapProperty("id", "name", queues);
        const wrapupCodes = await getAllGenesysItems("/api/v2/routing/wrapupcodes?sortBy=name&sortOrder=ascending", 100, "entities");
        window.wrapupCodeMapping = mapProperty("id", "name", wrapupCodes);
        const divisions = await getAllGenesysItems("/api/v2/authorization/divisions?", 200, "entities");
        window.divisionMapping = mapProperty("id", "name", divisions);
        const knowledgeBases = await getAllGenesysItems("/api/v2/knowledge/knowledgeBases?sortOrder=ASC&sortBy=name", 100, "entities");
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
    // fieldLevel, fieldType, customPath
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
    for (let conversation of window.conversationsData) {
        window.allConversations[conversation.conversationId] = conversation;
        // getConversationTurns(conversation);
        dataRows = dataRows.concat(getAllConversationSegments(conversation, fields, dataLevel));
    }
    window.displayTable = new PagedTable(headers, dataRows, 100, {}, true, true);
    const results = eById("results");
    clearElement(results);
    addElement(window.displayTable.getContainer(), results);

    // console.log(workflowStats);
    // console.log(botStats);
    // console.log(queueStats);
    // console.log(agentStats);
    return;
}

function mapProperty(propA, propB, objects) {
    const mapping = {};
    for (let object of objects) {
        mapping[object[propA]] = object[propB]
    }
    return mapping;
}

async function getAllUsers() {
    return getAllGenesysItems(`/api/v2/users?state=active`, 100, "entities");
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
    const currentDate = new Date().toISOString().split("T")[0];
    const date30DaysAgo = new Date(new Date().valueOf() - (86400000 * 30)).toISOString().split("T")[0];

    const inputs = newElement("div", { id: "inputs" });
    const startLabel = newElement('label', { innerText: "Start Date: " });
    const startDate = newElement('input', { type: "date", id: "startDate", value: date30DaysAgo });
    addElement(startDate, startLabel);
    const endLabel = newElement('label', { innerText: "End Date: " });
    const endDate = newElement('input', { type: "date", id: "endDate", value: currentDate });
    addElement(endDate, endLabel);
    const levelLabel = newElement('label', { innerText: "Data Level: " });
    const levelSelect = newElement('select', { id: "level" });
    for (let item of ["Conversation", "Participant", "Session", "Segment"]) {
        const levelOption = newElement("option", { value: item, innerText: item });
        addElement(levelOption, levelSelect);
    }
    addElement(levelSelect, levelLabel)
    const fieldContainer = newElement('div', { id: "fieldContainer" });
    addElement(createFieldOptions(), fieldContainer);

    const startButton = newElement('button', { innerText: "Start" });
    registerElement(startButton, "click", () => {showLoading(run)});
    const downloadAllButton = newElement('button', { innerText: "Download All" });
    registerElement(downloadAllButton, "click", () => { if (!window.displayTable) return; const headers = window.displayTable.getHeaders(); const data = window.displayTable.getFullData(); const download = createDownloadLink("Full Data Export.csv", Papa.unparse([headers, ...data]), "text/csv"); download.click(); });
    const downloadFilteredButton = newElement('button', { innerText: "Download Filtered" });
    registerElement(downloadFilteredButton, "click", () => { if (!window.displayTable) return; const headers = window.displayTable.getHeaders(); const data = window.displayTable.getFilteredData(); const download = createDownloadLink("Filtered Data Export.csv", Papa.unparse([headers, ...data]), "text/csv"); download.click(); });
    const logoutButton = newElement('button', { innerText: "Logout" });
    registerElement(logoutButton, "click", logout);
    const results = newElement('div', { id: "results" })
    addElements([startLabel, endLabel, levelLabel], inputs)
    addElements([inputs, fieldContainer, startButton, downloadAllButton, downloadFilteredButton, logoutButton, results], page);
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
        const option = newElement("option", { value: field.path, innerText: field.name });
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