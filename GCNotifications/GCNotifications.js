const formData = [
    {
        key: "flowId",
        name: "Flow ID",
        dependentValues: [
            "v2.analytics.flow.{flowId}.aggregates",
            "v2.flows.instances.flow.{flowId}",
            "v2.flows.{flowId}"
        ]
    }
]

const form = {
    children: [],
    fields: [
        {
            "name": "topic",
            "type": "select",
            "properties": {
                "id": "topic"
            },
            "options": [
                {
                    "value": "v2.analytics.conversations.details.jobs.availability",
                    "name": "v2.analytics.conversations.details.jobs.availability"
                },
                {
                    "value": "v2.analytics.flow.{flowId}.aggregates",
                    "name": "v2.analytics.flow.{flowId}.aggregates"
                },
                {
                    "value": "v2.analytics.flow.{flowOutcomeId}.aggregates",
                    "name": "v2.analytics.flow.{flowOutcomeId}.aggregates"
                },
                {
                    "value": "v2.analytics.queues.{queueId}.observations",
                    "name": "v2.analytics.queues.{queueId}.observations"
                },
                {
                    "value": "v2.analytics.users.details.jobs.availability",
                    "name": "v2.analytics.users.details.jobs.availability"
                },
                {
                    "value": "v2.analytics.users.{userId}.aggregates",
                    "name": "v2.analytics.users.{userId}.aggregates"
                },
                {
                    "value": "v2.analytics.wrapup.{wrapupCodeId}.aggregates",
                    "name": "v2.analytics.wrapup.{wrapupCodeId}.aggregates"
                },
                {
                    "value": "v2.architect.dependencytracking.build",
                    "name": "v2.architect.dependencytracking.build"
                },
                {
                    "value": "v2.architect.prompts.{promptId}",
                    "name": "v2.architect.prompts.{promptId}"
                },
                {
                    "value": "v2.architect.systemprompts.{promptId}.resources.{languageCode}",
                    "name": "v2.architect.systemprompts.{promptId}.resources.{languageCode}"
                },
                {
                    "value": "v2.architect.systemprompts.{promptId}.resources.{languageCode}",
                    "name": "v2.architect.systemprompts.{promptId}.resources.{languageCode}"
                },
                {
                    "value": "v2.audits.entitytype.{entityType}.entityid.{entityId}",
                    "name": "v2.audits.entitytype.{entityType}.entityid.{entityId}"
                },
                {
                    "value": "v2.businessunits.{businessUnitId}.workforcemanagement.intraday",
                    "name": "v2.businessunits.{businessUnitId}.workforcemanagement.intraday"
                },
                {
                    "value": "v2.contentmanagement.documents.{documentId}",
                    "name": "v2.contentmanagement.documents.{documentId}"
                },
                {
                    "value": "v2.contentmanagement.workspaces.{workspaceId}.documents",
                    "name": "v2.contentmanagement.workspaces.{workspaceId}.documents"
                },
                {
                    "value": "v2.conversations.{conversationId}.transcription",
                    "name": "v2.conversations.{conversationId}.transcription"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.acd.end",
                    "name": "v2.detail.events.conversation.{conversationId}.acd.end"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.acd.start",
                    "name": "v2.detail.events.conversation.{conversationId}.acd.start"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.acw",
                    "name": "v2.detail.events.conversation.{conversationId}.acw"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.attributes",
                    "name": "v2.detail.events.conversation.{conversationId}.attributes"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.contact",
                    "name": "v2.detail.events.conversation.{conversationId}.contact"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.customer.end",
                    "name": "v2.detail.events.conversation.{conversationId}.customer.end"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.customer.start",
                    "name": "v2.detail.events.conversation.{conversationId}.customer.start"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.flow.end",
                    "name": "v2.detail.events.conversation.{conversationId}.flow.end"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.flow.outcome",
                    "name": "v2.detail.events.conversation.{conversationId}.flow.outcome"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.flow.start",
                    "name": "v2.detail.events.conversation.{conversationId}.flow.start"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.outbound",
                    "name": "v2.detail.events.conversation.{conversationId}.outbound"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.user.end",
                    "name": "v2.detail.events.conversation.{conversationId}.user.end"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.user.start",
                    "name": "v2.detail.events.conversation.{conversationId}.user.start"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.voicemail.end",
                    "name": "v2.detail.events.conversation.{conversationId}.voicemail.end"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.voicemail.start",
                    "name": "v2.detail.events.conversation.{conversationId}.voicemail.start"
                },
                {
                    "value": "v2.detail.events.conversation.{conversationId}.wrapup",
                    "name": "v2.detail.events.conversation.{conversationId}.wrapup"
                },
                {
                    "value": "v2.externalcontacts.contacts.{contactId}",
                    "name": "v2.externalcontacts.contacts.{contactId}"
                },
                {
                    "value": "v2.externalcontacts.contacts.{contactId}.journey.sessions",
                    "name": "v2.externalcontacts.contacts.{contactId}.journey.sessions"
                },
                {
                    "value": "v2.externalcontacts.contacts.{contactId}.unresolved",
                    "name": "v2.externalcontacts.contacts.{contactId}.unresolved"
                },
                {
                    "value": "v2.flows.instances.flow.{flowId}",
                    "name": "v2.flows.instances.flow.{flowId}"
                },
                {
                    "value": "v2.flows.outcomes.{outcomeId}",
                    "name": "v2.flows.outcomes.{outcomeId}"
                },
                {
                    "value": "v2.flows.{flowId}",
                    "name": "v2.flows.{flowId}"
                },
                {
                    "value": "v2.gamification.scorecards.users.{userId}",
                    "name": "v2.gamification.scorecards.users.{userId}"
                },
                {
                    "value": "v2.groups.{userId}.greetings",
                    "name": "v2.groups.{userId}.greetings"
                },
                {
                    "value": "v2.journey.sessions.{sessionId}.action.events",
                    "name": "v2.journey.sessions.{sessionId}.action.events"
                },
                {
                    "value": "v2.journey.sessions.{sessionId}.app.events",
                    "name": "v2.journey.sessions.{sessionId}.app.events"
                },
                {
                    "value": "v2.journey.sessions.{sessionId}.outcome.events",
                    "name": "v2.journey.sessions.{sessionId}.outcome.events"
                },
                {
                    "value": "v2.journey.sessions.{sessionId}.web.events",
                    "name": "v2.journey.sessions.{sessionId}.web.events"
                },
                {
                    "value": "v2.managementunits.{managementUnitId}.workforcemanagement.intraday",
                    "name": "v2.managementunits.{managementUnitId}.workforcemanagement.intraday"
                },
                {
                    "value": "v2.operations.events.{operationalEventId}",
                    "name": "v2.operations.events.{operationalEventId}"
                },
                {
                    "value": "v2.outbound.attemptlimits.{outboundAttemptId}",
                    "name": "v2.outbound.attemptlimits.{outboundAttemptId}"
                },
                {
                    "value": "v2.outbound.callabletimesets.{callbackTimesetId}",
                    "name": "v2.outbound.callabletimesets.{callbackTimesetId}"
                },
                {
                    "value": "v2.outbound.campaignrules.{campaignRuleId}",
                    "name": "v2.outbound.campaignrules.{campaignRuleId}"
                },
                {
                    "value": "v2.outbound.campaigns.{campaignId}",
                    "name": "v2.outbound.campaigns.{campaignId}"
                },
                {
                    "value": "v2.outbound.campaigns.{campaignId}.progress",
                    "name": "v2.outbound.campaigns.{campaignId}.progress"
                },
                {
                    "value": "v2.outbound.campaigns.{campaignId}.stats",
                    "name": "v2.outbound.campaigns.{campaignId}.stats"
                },
                {
                    "value": "v2.outbound.contactlistfilters.{contactListId}",
                    "name": "v2.outbound.contactlistfilters.{contactListId}"
                },
                {
                    "value": "v2.outbound.contactlists.{campaignId}",
                    "name": "v2.outbound.contactlists.{campaignId}"
                },
                {
                    "value": "v2.outbound.contactlists.{contactListId}.importstatus",
                    "name": "v2.outbound.contactlists.{contactListId}.importstatus"
                },
                {
                    "value": "v2.outbound.dnclists.{DNCListId}",
                    "name": "v2.outbound.dnclists.{DNCListId}"
                },
                {
                    "value": "v2.outbound.dnclists.{DNCListId}.importstatus",
                    "name": "v2.outbound.dnclists.{DNCListId}.importstatus"
                },
                {
                    "value": "v2.outbound.importtemplates.{importTemplateId}.importstatus",
                    "name": "v2.outbound.importtemplates.{importTemplateId}.importstatus"
                },
                {
                    "value": "v2.outbound.messagingcampaigns.{messagingCampaignId}",
                    "name": "v2.outbound.messagingcampaigns.{messagingCampaignId}"
                },
                {
                    "value": "v2.outbound.messagingcampaigns.{messagingCampaignId}.progress",
                    "name": "v2.outbound.messagingcampaigns.{messagingCampaignId}.progress"
                },
                {
                    "value": "v2.outbound.responsesets.{callAnalysisSetId}",
                    "name": "v2.outbound.responsesets.{callAnalysisSetId}"
                },
                {
                    "value": "v2.outbound.rulesets.{ruleSetId}",
                    "name": "v2.outbound.rulesets.{ruleSetId}"
                },
                {
                    "value": "v2.outbound.schedules.campaigns.{campaignId}",
                    "name": "v2.outbound.schedules.campaigns.{campaignId}"
                },
                {
                    "value": "v2.outbound.schedules.sequences.{sequenceId}",
                    "name": "v2.outbound.schedules.sequences.{sequenceId}"
                },
                {
                    "value": "v2.outbound.sequences.{sequenceId}",
                    "name": "v2.outbound.sequences.{sequenceId}"
                },
                {
                    "value": "v2.outbound.settings",
                    "name": "v2.outbound.settings"
                },
                {
                    "value": "v2.outbound.wrapupcodemappings.{wrapUpCodeMappingId}",
                    "name": "v2.outbound.wrapupcodemappings.{wrapUpCodeMappingId}"
                },
                {
                    "value": "v2.quality.evaluations",
                    "name": "v2.quality.evaluations"
                },
                {
                    "value": "v2.routing.queues.{queueId}.conversations",
                    "name": "v2.routing.queues.{queueId}.conversations"
                },
                {
                    "value": "v2.routing.queues.{queueId}.conversations.callbacks",
                    "name": "v2.routing.queues.{queueId}.conversations.callbacks"
                },
                {
                    "value": "v2.routing.queues.{queueId}.conversations.calls",
                    "name": "v2.routing.queues.{queueId}.conversations.calls"
                },
                {
                    "value": "v2.routing.queues.{queueId}.conversations.chats",
                    "name": "v2.routing.queues.{queueId}.conversations.chats"
                },
                {
                    "value": "v2.routing.queues.{queueId}.conversations.cobrowseSessions",
                    "name": "v2.routing.queues.{queueId}.conversations.cobrowseSessions"
                },
                {
                    "value": "v2.routing.queues.{queueId}.conversations.emails",
                    "name": "v2.routing.queues.{queueId}.conversations.emails"
                },
                {
                    "value": "v2.routing.queues.{queueId}.conversations.messages",
                    "name": "v2.routing.queues.{queueId}.conversations.messages"
                },
                {
                    "value": "v2.routing.queues.{queueId}.conversations.screenshares",
                    "name": "v2.routing.queues.{queueId}.conversations.screenshares"
                },
                {
                    "value": "v2.routing.queues.{queueId}.conversations.socialexpressions",
                    "name": "v2.routing.queues.{queueId}.conversations.socialexpressions"
                },
                {
                    "value": "v2.routing.queues.{queueId}.conversations.videos",
                    "name": "v2.routing.queues.{queueId}.conversations.videos"
                },
                {
                    "value": "v2.routing.queues.{queueId}.users",
                    "name": "v2.routing.queues.{queueId}.users"
                },
                {
                    "value": "v2.speechandtextanalytics.programs.general.jobs.{jobId}",
                    "name": "v2.speechandtextanalytics.programs.general.jobs.{jobId}"
                },
                {
                    "value": "v2.speechandtextanalytics.programs.publishjobs.{jobId}",
                    "name": "v2.speechandtextanalytics.programs.publishjobs.{jobId}"
                },
                {
                    "value": "v2.speechandtextanalytics.topics.publishjobs.{jobId}",
                    "name": "v2.speechandtextanalytics.topics.publishjobs.{jobId}"
                },
                {
                    "value": "v2.taskmanagement.workitems.queues.{queueId}",
                    "name": "v2.taskmanagement.workitems.queues.{queueId}"
                },
                {
                    "value": "v2.taskmanagement.workitems.users.{userId}",
                    "name": "v2.taskmanagement.workitems.users.{userId}"
                },
                {
                    "value": "v2.taskmanagement.workitems.{workitemId}",
                    "name": "v2.taskmanagement.workitems.{workitemId}"
                },
                {
                    "value": "v2.telephony.providers.edges.phones.{phoneId}",
                    "name": "v2.telephony.providers.edges.phones.{phoneId}"
                },
                {
                    "value": "v2.telephony.providers.edges.trunks.{trunkId}",
                    "name": "v2.telephony.providers.edges.trunks.{trunkId}"
                },
                {
                    "value": "v2.telephony.providers.edges.trunks.{trunkId}.metrics",
                    "name": "v2.telephony.providers.edges.trunks.{trunkId}.metrics"
                },
                {
                    "value": "v2.telephony.providers.edges.{edgeId}",
                    "name": "v2.telephony.providers.edges.{edgeId}"
                },
                {
                    "value": "v2.telephony.providers.edges.{edgeId}.logicalinterfaces",
                    "name": "v2.telephony.providers.edges.{edgeId}.logicalinterfaces"
                },
                {
                    "value": "v2.telephony.providers.edges.{edgeId}.metrics",
                    "name": "v2.telephony.providers.edges.{edgeId}.metrics"
                },
                {
                    "value": "v2.telephony.providers.edges.{edgeId}.softwareupdate",
                    "name": "v2.telephony.providers.edges.{edgeId}.softwareupdate"
                },
                {
                    "value": "v2.users.{userId}.activity",
                    "name": "v2.users.{userId}.activity"
                },
                {
                    "value": "v2.users.{userId}.alerting.alerts",
                    "name": "v2.users.{userId}.alerting.alerts"
                },
                {
                    "value": "v2.users.{userId}.alerting.heartbeat.alerts",
                    "name": "v2.users.{userId}.alerting.heartbeat.alerts"
                },
                {
                    "value": "v2.users.{userId}.alerting.heartbeat.rules",
                    "name": "v2.users.{userId}.alerting.heartbeat.rules"
                },
                {
                    "value": "v2.users.{userId}.alerting.interactionstats.alerts",
                    "name": "v2.users.{userId}.alerting.interactionstats.alerts"
                },
                {
                    "value": "v2.users.{userId}.alerting.interactionstats.rules",
                    "name": "v2.users.{userId}.alerting.interactionstats.rules"
                },
                {
                    "value": "v2.users.{userId}.alerting.rules",
                    "name": "v2.users.{userId}.alerting.rules"
                },
                {
                    "value": "v2.users.{userId}.analytics.reporting.exports",
                    "name": "v2.users.{userId}.analytics.reporting.exports"
                },
                {
                    "value": "v2.users.{userId}.badges.chats",
                    "name": "v2.users.{userId}.badges.chats"
                },
                {
                    "value": "v2.users.{userId}.callforwarding",
                    "name": "v2.users.{userId}.callforwarding"
                },
                {
                    "value": "v2.users.{userId}.conversations",
                    "name": "v2.users.{userId}.conversations"
                },
                {
                    "value": "v2.users.{userId}.conversations.callbacks",
                    "name": "v2.users.{userId}.conversations.callbacks"
                },
                {
                    "value": "v2.users.{userId}.conversations.calls",
                    "name": "v2.users.{userId}.conversations.calls"
                },
                {
                    "value": "v2.users.{userId}.conversations.chats",
                    "name": "v2.users.{userId}.conversations.chats"
                },
                {
                    "value": "v2.users.{userId}.conversations.cobrowseSessions",
                    "name": "v2.users.{userId}.conversations.cobrowseSessions"
                },
                {
                    "value": "v2.users.{userId}.conversations.emails",
                    "name": "v2.users.{userId}.conversations.emails"
                },
                {
                    "value": "v2.users.{userId}.conversations.inbound.typing.event",
                    "name": "v2.users.{userId}.conversations.inbound.typing.event"
                },
                {
                    "value": "v2.users.{userId}.conversations.messages",
                    "name": "v2.users.{userId}.conversations.messages"
                },
                {
                    "value": "v2.users.{userId}.conversations.screenshares",
                    "name": "v2.users.{userId}.conversations.screenshares"
                },
                {
                    "value": "v2.users.{userId}.conversations.socialexpressions",
                    "name": "v2.users.{userId}.conversations.socialexpressions"
                },
                {
                    "value": "v2.users.{userId}.conversations.videos",
                    "name": "v2.users.{userId}.conversations.videos"
                },
                {
                    "value": "v2.users.{userId}.conversations.{conversationId}.recordings",
                    "name": "v2.users.{userId}.conversations.{conversationId}.recordings"
                },
                {
                    "value": "v2.users.{userId}.conversations.{conversationId}.recordings.{recordingId}",
                    "name": "v2.users.{userId}.conversations.{conversationId}.recordings.{recordingId}"
                },
                {
                    "value": "v2.users.{userId}.conversationsummary",
                    "name": "v2.users.{userId}.conversationsummary"
                },
                {
                    "value": "v2.users.{userId}.fax.documents",
                    "name": "v2.users.{userId}.fax.documents"
                },
                {
                    "value": "v2.users.{userId}.geolocation",
                    "name": "v2.users.{userId}.geolocation"
                },
                {
                    "value": "v2.users.{userId}.greeting",
                    "name": "v2.users.{userId}.greeting"
                },
                {
                    "value": "v2.users.{userId}.outbound.contactlists.{contactListId}.export",
                    "name": "v2.users.{userId}.outbound.contactlists.{contactListId}.export"
                },
                {
                    "value": "v2.users.{userId}.outbound.dnclists.{DNCListId}.export",
                    "name": "v2.users.{userId}.outbound.dnclists.{DNCListId}.export"
                },
                {
                    "value": "v2.users.{userId}.outofoffice",
                    "name": "v2.users.{userId}.outofoffice"
                },
                {
                    "value": "v2.users.{userId}.presence",
                    "name": "v2.users.{userId}.presence"
                },
                {
                    "value": "v2.users.{userId}.recordings",
                    "name": "v2.users.{userId}.recordings"
                },
                {
                    "value": "v2.users.{userId}.routingStatus",
                    "name": "v2.users.{userId}.routingStatus"
                },
                {
                    "value": "v2.users.{userId}.station",
                    "name": "v2.users.{userId}.station"
                },
                {
                    "value": "v2.users.{userId}.tokens",
                    "name": "v2.users.{userId}.tokens"
                },
                {
                    "value": "v2.users.{userId}.userrecordings",
                    "name": "v2.users.{userId}.userrecordings"
                },
                {
                    "value": "v2.users.{userId}.voicemail.messages",
                    "name": "v2.users.{userId}.voicemail.messages"
                },
                {
                    "value": "v2.users.{userId}.wem.coaching.notifications",
                    "name": "v2.users.{userId}.wem.coaching.notifications"
                },
                {
                    "value": "v2.users.{userId}.wem.learning.assignment",
                    "name": "v2.users.{userId}.wem.learning.assignment"
                },
                {
                    "value": "v2.users.{userId}.workforcemanagement.adherence",
                    "name": "v2.users.{userId}.workforcemanagement.adherence"
                },
                {
                    "value": "v2.users.{userId}.workforcemanagement.adherence.explanations.jobs",
                    "name": "v2.users.{userId}.workforcemanagement.adherence.explanations.jobs"
                },
                {
                    "value": "v2.users.{userId}.workforcemanagement.adherence.historical.bulk",
                    "name": "v2.users.{userId}.workforcemanagement.adherence.historical.bulk"
                },
                {
                    "value": "v2.users.{userId}.workforcemanagement.historicaladherencequery",
                    "name": "v2.users.{userId}.workforcemanagement.historicaladherencequery"
                },
                {
                    "value": "v2.users.{userId}.workforcemanagement.integrations.hris.timeofftypes.jobs",
                    "name": "v2.users.{userId}.workforcemanagement.integrations.hris.timeofftypes.jobs"
                },
                {
                    "value": "v2.users.{userId}.workforcemanagement.notifications",
                    "name": "v2.users.{userId}.workforcemanagement.notifications"
                },
                {
                    "value": "v2.users.{userId}.workforcemanagement.performanceprediction.schedules.recalculations",
                    "name": "v2.users.{userId}.workforcemanagement.performanceprediction.schedules.recalculations"
                },
                {
                    "value": "v2.users.{userId}.workforcemanagement.schedules",
                    "name": "v2.users.{userId}.workforcemanagement.schedules"
                },
                {
                    "value": "v2.users.{userId}.workforcemanagement.shrinkage.jobs",
                    "name": "v2.users.{userId}.workforcemanagement.shrinkage.jobs"
                },
                {
                    "value": "v2.users.{userId}.workforcemanagement.timeoffbalance.jobs",
                    "name": "v2.users.{userId}.workforcemanagement.timeoffbalance.jobs"
                },
                {
                    "value": "v2.users.{userId}.workforcemanagement.timeoffrequests",
                    "name": "v2.users.{userId}.workforcemanagement.timeoffrequests"
                },
                {
                    "value": "v2.video.conferences.{conferenceJid}",
                    "name": "v2.video.conferences.{conferenceJid}"
                },
                {
                    "value": "v2.webdeployments.configurations.{configurationId}",
                    "name": "v2.webdeployments.configurations.{configurationId}"
                },
                {
                    "value": "v2.webdeployments.deployments.{deploymentId}",
                    "name": "v2.webdeployments.deployments.{deploymentId}"
                },
                {
                    "value": "v2.wem.learning.assignments.modules.{moduleId}",
                    "name": "v2.wem.learning.assignments.modules.{moduleId}"
                },
                {
                    "value": "v2.workflows.{workflowId}.conversations.inbound.typing.event",
                    "name": "v2.workflows.{workflowId}.conversations.inbound.typing.event"
                },
                {
                    "value": "v2.workforcemanagement.agents",
                    "name": "v2.workforcemanagement.agents"
                },
                {
                    "value": "v2.workforcemanagement.agents.{agentId}.adherence.explanations.{adherenceExplanationId}",
                    "name": "v2.workforcemanagement.agents.{agentId}.adherence.explanations.{adherenceExplanationId}"
                },
                {
                    "value": "v2.workforcemanagement.businessunits.{businessUnitId}.adherence.explanations",
                    "name": "v2.workforcemanagement.businessunits.{businessUnitId}.adherence.explanations"
                },
                {
                    "value": "v2.workforcemanagement.businessunits.{businessUnitId}.forecasts.staffingrequirement",
                    "name": "v2.workforcemanagement.businessunits.{businessUnitId}.forecasts.staffingrequirement"
                },
                {
                    "value": "v2.workforcemanagement.businessunits.{businessUnitId}.schedules",
                    "name": "v2.workforcemanagement.businessunits.{businessUnitId}.schedules"
                },
                {
                    "value": "v2.workforcemanagement.businessunits.{businessUnitId}.scheduling.runs",
                    "name": "v2.workforcemanagement.businessunits.{businessUnitId}.scheduling.runs"
                },
                {
                    "value": "v2.workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts",
                    "name": "v2.workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts"
                },
                {
                    "value": "v2.workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts.copy",
                    "name": "v2.workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts.copy"
                },
                {
                    "value": "v2.workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts.generate",
                    "name": "v2.workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts.generate"
                },
                {
                    "value": "v2.workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts.import",
                    "name": "v2.workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts.import"
                },
                {
                    "value": "v2.workforcemanagement.historicaldata.deletejob",
                    "name": "v2.workforcemanagement.historicaldata.deletejob"
                },
                {
                    "value": "v2.workforcemanagement.historicaldata.status",
                    "name": "v2.workforcemanagement.historicaldata.status"
                },
                {
                    "value": "v2.workforcemanagement.managementunits.{managementUnitId}",
                    "name": "v2.workforcemanagement.managementunits.{managementUnitId}"
                },
                {
                    "value": "v2.workforcemanagement.managementunits.{managementUnitId}.adherence",
                    "name": "v2.workforcemanagement.managementunits.{managementUnitId}.adherence"
                },
                {
                    "value": "v2.workforcemanagement.managementunits.{managementUnitId}.agents.sync",
                    "name": "v2.workforcemanagement.managementunits.{managementUnitId}.agents.sync"
                },
                {
                    "value": "v2.workforcemanagement.managementunits.{managementUnitId}.schedules",
                    "name": "v2.workforcemanagement.managementunits.{managementUnitId}.schedules"
                },
                {
                    "value": "v2.workforcemanagement.managementunits.{managementUnitId}.shifttrades.state.bulk",
                    "name": "v2.workforcemanagement.managementunits.{managementUnitId}.shifttrades.state.bulk"
                },
                {
                    "value": "v2.workforcemanagement.performanceprediction.schedules.{scheduleId}",
                    "name": "v2.workforcemanagement.performanceprediction.schedules.{scheduleId}"
                },
                {
                    "value": "v2.workforcemanagement.teams.{teamId}.adherence",
                    "name": "v2.workforcemanagement.teams.{teamId}.adherence"
                },
                {
                    "value": "v2.workforcemanagement.users.{userId}.schedules.query",
                    "name": "v2.workforcemanagement.users.{userId}.schedules.query"
                }
            ]
        },
        {
            "name": "flowId",
            "label": "Flow ID: ",
            "type": "input",
            "properties": {
                "id": "flowId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.analytics.flow.{flowId}.aggregates",
                    "v2.flows.instances.flow.{flowId}",
                    "v2.flows.{flowId}"
                ]
            }
        },
        {
            "name": "flowOutcomeId",
            "label": "Flow Outcome ID: ",
            "type": "input",
            "properties": {
                "id": "flowOutcomeId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.analytics.flow.{flowOutcomeId}.aggregates"
                ]
            }
        },
        {
            "name": "queueId",
            "label": "Queue ID: ",
            "type": "input",
            "properties": {
                "id": "queueId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.analytics.queues.{queueId}.observations",
                    "v2.routing.queues.{queueId}.conversations",
                    "v2.routing.queues.{queueId}.conversations.callbacks",
                    "v2.routing.queues.{queueId}.conversations.calls",
                    "v2.routing.queues.{queueId}.conversations.chats",
                    "v2.routing.queues.{queueId}.conversations.cobrowseSessions",
                    "v2.routing.queues.{queueId}.conversations.emails",
                    "v2.routing.queues.{queueId}.conversations.messages",
                    "v2.routing.queues.{queueId}.conversations.screenshares",
                    "v2.routing.queues.{queueId}.conversations.socialexpressions",
                    "v2.routing.queues.{queueId}.conversations.videos",
                    "v2.routing.queues.{queueId}.users",
                    "v2.taskmanagement.workitems.queues.{queueId}"
                ]
            }
        },
        {
            "name": "userId",
            "label": "User ID: ",
            "type": "input",
            "properties": {
                "id": "userId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.analytics.users.{userId}.aggregates",
                    "v2.gamification.scorecards.users.{userId}",
                    "v2.groups.{userId}.greetings",
                    "v2.taskmanagement.workitems.users.{userId}",
                    "v2.users.{userId}.activity",
                    "v2.users.{userId}.alerting.alerts",
                    "v2.users.{userId}.alerting.heartbeat.alerts",
                    "v2.users.{userId}.alerting.heartbeat.rules",
                    "v2.users.{userId}.alerting.interactionstats.alerts",
                    "v2.users.{userId}.alerting.interactionstats.rules",
                    "v2.users.{userId}.alerting.rules",
                    "v2.users.{userId}.analytics.reporting.exports",
                    "v2.users.{userId}.badges.chats",
                    "v2.users.{userId}.callforwarding",
                    "v2.users.{userId}.conversations",
                    "v2.users.{userId}.conversations.callbacks",
                    "v2.users.{userId}.conversations.calls",
                    "v2.users.{userId}.conversations.chats",
                    "v2.users.{userId}.conversations.cobrowseSessions",
                    "v2.users.{userId}.conversations.emails",
                    "v2.users.{userId}.conversations.inbound.typing.event",
                    "v2.users.{userId}.conversations.messages",
                    "v2.users.{userId}.conversations.screenshares",
                    "v2.users.{userId}.conversations.socialexpressions",
                    "v2.users.{userId}.conversations.videos",
                    "v2.users.{userId}.conversations.{conversationId}.recordings",
                    "v2.users.{userId}.conversations.{conversationId}.recordings.{recordingId}",
                    "v2.users.{userId}.conversationsummary",
                    "v2.users.{userId}.fax.documents",
                    "v2.users.{userId}.geolocation",
                    "v2.users.{userId}.greeting",
                    "v2.users.{userId}.outbound.contactlists.{contactListId}.export",
                    "v2.users.{userId}.outbound.dnclists.{DNCListId}.export",
                    "v2.users.{userId}.outofoffice",
                    "v2.users.{userId}.presence",
                    "v2.users.{userId}.recordings",
                    "v2.users.{userId}.routingStatus",
                    "v2.users.{userId}.station",
                    "v2.users.{userId}.tokens",
                    "v2.users.{userId}.userrecordings",
                    "v2.users.{userId}.voicemail.messages",
                    "v2.users.{userId}.wem.coaching.notifications",
                    "v2.users.{userId}.wem.learning.assignment",
                    "v2.users.{userId}.workforcemanagement.adherence",
                    "v2.users.{userId}.workforcemanagement.adherence.explanations.jobs",
                    "v2.users.{userId}.workforcemanagement.adherence.historical.bulk",
                    "v2.users.{userId}.workforcemanagement.historicaladherencequery",
                    "v2.users.{userId}.workforcemanagement.integrations.hris.timeofftypes.jobs",
                    "v2.users.{userId}.workforcemanagement.notifications",
                    "v2.users.{userId}.workforcemanagement.performanceprediction.schedules.recalculations",
                    "v2.users.{userId}.workforcemanagement.schedules",
                    "v2.users.{userId}.workforcemanagement.shrinkage.jobs",
                    "v2.users.{userId}.workforcemanagement.timeoffbalance.jobs",
                    "v2.users.{userId}.workforcemanagement.timeoffrequests",
                    "v2.workforcemanagement.users.{userId}.schedules.query"
                ]
            }
        },
        {
            "name": "wrapupCodeId",
            "label": "Wrapup Code ID: ",
            "type": "input",
            "properties": {
                "id": "wrapupCodeId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.analytics.wrapup.{wrapupCodeId}.aggregates"
                ]
            }
        },
        {
            "name": "promptId",
            "label": "Prompt ID: ",
            "type": "input",
            "properties": {
                "id": "promptId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.architect.prompts.{promptId}",
                    "v2.architect.systemprompts.{promptId}.resources.{languageCode}",
                    "v2.architect.systemprompts.{promptId}.resources.{languageCode}"
                ]
            }
        },
        {
            "name": "languageCode",
            "label": "Language Code: ",
            "type": "input",
            "properties": {
                "id": "languageCode"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.architect.systemprompts.{promptId}.resources.{languageCode}",
                    "v2.architect.systemprompts.{promptId}.resources.{languageCode}"
                ]
            }
        },
        {
            "name": "entityType",
            "label": "Entity Type: ",
            "type": "input",
            "properties": {
                "id": "entityType"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.audits.entitytype.{entityType}.entityid.{entityId}"
                ]
            }
        },
        {
            "name": "entityId",
            "label": "Entity ID: ",
            "type": "input",
            "properties": {
                "id": "entityId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.audits.entitytype.{entityType}.entityid.{entityId}"
                ]
            }
        },
        {
            "name": "businessUnitId",
            "label": "Business Unit ID: ",
            "type": "input",
            "properties": {
                "id": "businessUnitId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.businessunits.{businessUnitId}.workforcemanagement.intraday",
                    "v2.workforcemanagement.businessunits.{businessUnitId}.adherence.explanations",
                    "v2.workforcemanagement.businessunits.{businessUnitId}.forecasts.staffingrequirement",
                    "v2.workforcemanagement.businessunits.{businessUnitId}.schedules",
                    "v2.workforcemanagement.businessunits.{businessUnitId}.scheduling.runs",
                    "v2.workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts",
                    "v2.workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts.copy",
                    "v2.workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts.generate",
                    "v2.workforcemanagement.businessunits.{businessUnitId}.shorttermforecasts.import"
                ]
            }
        },
        {
            "name": "documentId",
            "label": "Document ID: ",
            "type": "input",
            "properties": {
                "id": "documentId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.contentmanagement.documents.{documentId}"
                ]
            }
        },
        {
            "name": "workspaceId",
            "label": "Workspace ID: ",
            "type": "input",
            "properties": {
                "id": "workspaceId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.contentmanagement.workspaces.{workspaceId}.documents"
                ]
            }
        },
        {
            "name": "conversationId",
            "label": "Conversation ID: ",
            "type": "input",
            "properties": {
                "id": "conversationId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.conversations.{conversationId}.transcription",
                    "v2.detail.events.conversation.{conversationId}.acd.end",
                    "v2.detail.events.conversation.{conversationId}.acd.start",
                    "v2.detail.events.conversation.{conversationId}.acw",
                    "v2.detail.events.conversation.{conversationId}.attributes",
                    "v2.detail.events.conversation.{conversationId}.contact",
                    "v2.detail.events.conversation.{conversationId}.customer.end",
                    "v2.detail.events.conversation.{conversationId}.customer.start",
                    "v2.detail.events.conversation.{conversationId}.flow.end",
                    "v2.detail.events.conversation.{conversationId}.flow.outcome",
                    "v2.detail.events.conversation.{conversationId}.flow.start",
                    "v2.detail.events.conversation.{conversationId}.outbound",
                    "v2.detail.events.conversation.{conversationId}.user.end",
                    "v2.detail.events.conversation.{conversationId}.user.start",
                    "v2.detail.events.conversation.{conversationId}.voicemail.end",
                    "v2.detail.events.conversation.{conversationId}.voicemail.start",
                    "v2.detail.events.conversation.{conversationId}.wrapup",
                    "v2.users.{userId}.conversations.{conversationId}.recordings",
                    "v2.users.{userId}.conversations.{conversationId}.recordings.{recordingId}"
                ]
            }
        },
        {
            "name": "contactId",
            "label": "Contact ID: ",
            "type": "input",
            "properties": {
                "id": "contactId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.externalcontacts.contacts.{contactId}",
                    "v2.externalcontacts.contacts.{contactId}.journey.sessions",
                    "v2.externalcontacts.contacts.{contactId}.unresolved"
                ]
            }
        },
        {
            "name": "outcomeId",
            "label": "Outcome ID: ",
            "type": "input",
            "properties": {
                "id": "outcomeId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.flows.outcomes.{outcomeId}"
                ]
            }
        },
        {
            "name": "sessionId",
            "label": "Session ID: ",
            "type": "input",
            "properties": {
                "id": "sessionId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.journey.sessions.{sessionId}.action.events",
                    "v2.journey.sessions.{sessionId}.app.events",
                    "v2.journey.sessions.{sessionId}.outcome.events",
                    "v2.journey.sessions.{sessionId}.web.events"
                ]
            }
        },
        {
            "name": "managementUnitId",
            "label": "Management Unit ID: ",
            "type": "input",
            "properties": {
                "id": "managementUnitId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.managementunits.{managementUnitId}.workforcemanagement.intraday",
                    "v2.workforcemanagement.managementunits.{managementUnitId}",
                    "v2.workforcemanagement.managementunits.{managementUnitId}.adherence",
                    "v2.workforcemanagement.managementunits.{managementUnitId}.agents.sync",
                    "v2.workforcemanagement.managementunits.{managementUnitId}.schedules",
                    "v2.workforcemanagement.managementunits.{managementUnitId}.shifttrades.state.bulk"
                ]
            }
        },
        {
            "name": "operationalEventId",
            "label": "Operational Event ID: ",
            "type": "input",
            "properties": {
                "id": "operationalEventId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.operations.events.{operationalEventId}"
                ]
            }
        },
        {
            "name": "outboundAttemptId",
            "label": "Outbound Attempt ID: ",
            "type": "input",
            "properties": {
                "id": "outboundAttemptId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.outbound.attemptlimits.{outboundAttemptId}"
                ]
            }
        },
        {
            "name": "callbackTimesetId",
            "label": "Callback Timeset ID: ",
            "type": "input",
            "properties": {
                "id": "callbackTimesetId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.outbound.callabletimesets.{callbackTimesetId}"
                ]
            }
        },
        {
            "name": "campaignRuleId",
            "label": "Campaign Rule ID: ",
            "type": "input",
            "properties": {
                "id": "campaignRuleId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.outbound.campaignrules.{campaignRuleId}"
                ]
            }
        },
        {
            "name": "campaignId",
            "label": "Campaign ID: ",
            "type": "input",
            "properties": {
                "id": "campaignId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.outbound.campaigns.{campaignId}",
                    "v2.outbound.campaigns.{campaignId}.progress",
                    "v2.outbound.campaigns.{campaignId}.stats",
                    "v2.outbound.contactlists.{campaignId}",
                    "v2.outbound.schedules.campaigns.{campaignId}"
                ]
            }
        },
        {
            "name": "contactListId",
            "label": "Contact List ID: ",
            "type": "input",
            "properties": {
                "id": "contactListId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.outbound.contactlistfilters.{contactListId}",
                    "v2.outbound.contactlists.{contactListId}.importstatus",
                    "v2.users.{userId}.outbound.contactlists.{contactListId}.export"
                ]
            }
        },
        {
            "name": "DNCListId",
            "label": "DNC List ID: ",
            "type": "input",
            "properties": {
                "id": "DNCListId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.outbound.dnclists.{DNCListId}",
                    "v2.outbound.dnclists.{DNCListId}.importstatus",
                    "v2.users.{userId}.outbound.dnclists.{DNCListId}.export"
                ]
            }
        },
        {
            "name": "importTemplateId",
            "label": "Import Template ID: ",
            "type": "input",
            "properties": {
                "id": "importTemplateId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.outbound.importtemplates.{importTemplateId}.importstatus"
                ]
            }
        },
        {
            "name": "messagingCampaignId",
            "label": "Messaging Campaign ID: ",
            "type": "input",
            "properties": {
                "id": "messagingCampaignId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.outbound.messagingcampaigns.{messagingCampaignId}",
                    "v2.outbound.messagingcampaigns.{messagingCampaignId}.progress"
                ]
            }
        },
        {
            "name": "callAnalysisSetId",
            "label": "Call Analysis Set ID: ",
            "type": "input",
            "properties": {
                "id": "callAnalysisSetId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.outbound.responsesets.{callAnalysisSetId}"
                ]
            }
        },
        {
            "name": "ruleSetId",
            "label": "Rule Set ID: ",
            "type": "input",
            "properties": {
                "id": "ruleSetId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.outbound.rulesets.{ruleSetId}"
                ]
            }
        },
        {
            "name": "sequenceId",
            "label": "Sequence ID: ",
            "type": "input",
            "properties": {
                "id": "sequenceId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.outbound.schedules.sequences.{sequenceId}",
                    "v2.outbound.sequences.{sequenceId}"
                ]
            }
        },
        {
            "name": "wrapUpCodeMappingId",
            "label": "Wrap Up Code Mapping ID: ",
            "type": "input",
            "properties": {
                "id": "wrapUpCodeMappingId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.outbound.wrapupcodemappings.{wrapUpCodeMappingId}"
                ]
            }
        },
        {
            "name": "jobId",
            "label": "Job ID: ",
            "type": "input",
            "properties": {
                "id": "jobId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.speechandtextanalytics.programs.general.jobs.{jobId}",
                    "v2.speechandtextanalytics.programs.publishjobs.{jobId}",
                    "v2.speechandtextanalytics.topics.publishjobs.{jobId}"
                ]
            }
        },
        {
            "name": "workitemId",
            "label": "Workitem ID: ",
            "type": "input",
            "properties": {
                "id": "workitemId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.taskmanagement.workitems.{workitemId}"
                ]
            }
        },
        {
            "name": "phoneId",
            "label": "Phone ID: ",
            "type": "input",
            "properties": {
                "id": "phoneId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.telephony.providers.edges.phones.{phoneId}"
                ]
            }
        },
        {
            "name": "trunkId",
            "label": "Trunk ID: ",
            "type": "input",
            "properties": {
                "id": "trunkId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.telephony.providers.edges.trunks.{trunkId}",
                    "v2.telephony.providers.edges.trunks.{trunkId}.metrics"
                ]
            }
        },
        {
            "name": "edgeId",
            "label": "Edge ID: ",
            "type": "input",
            "properties": {
                "id": "edgeId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.telephony.providers.edges.{edgeId}",
                    "v2.telephony.providers.edges.{edgeId}.logicalinterfaces",
                    "v2.telephony.providers.edges.{edgeId}.metrics",
                    "v2.telephony.providers.edges.{edgeId}.softwareupdate"
                ]
            }
        },
        {
            "name": "recordingId",
            "label": "Recording ID: ",
            "type": "input",
            "properties": {
                "id": "recordingId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.users.{userId}.conversations.{conversationId}.recordings.{recordingId}"
                ]
            }
        },
        {
            "name": "conferenceJid",
            "label": "Conference Jid: ",
            "type": "input",
            "properties": {
                "id": "conferenceJid"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.video.conferences.{conferenceJid}"
                ]
            }
        },
        {
            "name": "configurationId",
            "label": "Configuration ID: ",
            "type": "input",
            "properties": {
                "id": "configurationId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.webdeployments.configurations.{configurationId}"
                ]
            }
        },
        {
            "name": "deploymentId",
            "label": "Deployment ID: ",
            "type": "input",
            "properties": {
                "id": "deploymentId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.webdeployments.deployments.{deploymentId}"
                ]
            }
        },
        {
            "name": "moduleId",
            "label": "Module ID: ",
            "type": "input",
            "properties": {
                "id": "moduleId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.wem.learning.assignments.modules.{moduleId}"
                ]
            }
        },
        {
            "name": "workflowId",
            "label": "Workflow ID: ",
            "type": "input",
            "properties": {
                "id": "workflowId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.workflows.{workflowId}.conversations.inbound.typing.event"
                ]
            }
        },
        {
            "name": "agentId",
            "label": "Agent ID: ",
            "type": "input",
            "properties": {
                "id": "agentId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.workforcemanagement.agents.{agentId}.adherence.explanations.{adherenceExplanationId}"
                ]
            }
        },
        {
            "name": "adherenceExplanationId",
            "label": "Adherence Explanation ID: ",
            "type": "input",
            "properties": {
                "id": "adherenceExplanationId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.workforcemanagement.agents.{agentId}.adherence.explanations.{adherenceExplanationId}"
                ]
            }
        },
        {
            "name": "scheduleId",
            "label": "Schedule ID: ",
            "type": "input",
            "properties": {
                "id": "scheduleId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.workforcemanagement.performanceprediction.schedules.{scheduleId}"
                ]
            }
        },
        {
            "name": "teamId",
            "label": "Team ID: ",
            "type": "input",
            "properties": {
                "id": "teamId"
            },
            "dependsOn": {
                "fieldName": "topic",
                "fieldValues": [
                    "v2.workforcemanagement.teams.{teamId}.adherence"
                ]
            }
        }
    ]
}

async function getMessages(conversationId, messageIds) {
    return makeGenesysRequest(`/api/v2/conversations/messages/${conversationId}/messages/bulk`, 'POST', JSON.stringify(messageIds));
}

async function createChannel() {
    return makeGenesysRequest(`/api/v2/notifications/channels`, 'POST');
}

async function addSubscriptions(channelId, subscriptions) {
    return makeGenesysRequest(`/api/v2/notifications/channels/${channelId}/subscriptions`, 'POST', JSON.stringify(subscriptions));
}

async function run() {
    const newChannel = await createChannel();
    const socketConnection = new WebSocket(newChannel.connectUri);

    socketConnection.onopen = (event) => {
        log(event.data || "");
    }
    socketConnection.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.topicName !== topic) return;
        log(message.eventBody || "");
    }
    socketConnection.onerror = (event) => {
        log(event.data || "");
    }

    let topic = eById('topic').value;
    const params = getParams(topic);
    log(params)
    for (let param of params) {
        console.log(param.key, param.replace, topic);
        const value = eById(param.key).value;
        topic = topic.replace(param.replace, value);
    }

    await addSubscriptions(newChannel.id, [{id: topic}]);
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
    const selectForm = new DependentForm(form);

    const startButton = newElement('button', { innerText: "Start" });
    registerElement(startButton, "click", run);
    const logoutButton = newElement('button', { innerText: "Logout" });
    registerElement(logoutButton, "click", logout);
    const results = newElement('div', { id: "results" });

    addElement(selectForm.getContainer(), inputs);
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

async function getFlowOptions() {
    const options = [];
    if (!window.flowMapping) await populateSelects();
    for (let flow in window.flowMapping) {
        const option = {};
        option.name = flow;
        option.value = window.flowMapping[flow];
    }
    return options;
}

async function populateSelects() {
    const orgInfoCacheKey = window.orgId;

    if (window.orgInfoCacheKey !== orgInfoCacheKey) {
        const users = await getAllGenesysItems(`/api/v2/users?state=active`, 100, "entities");
        window.usersMapping = mapProperty("id", "name", users);
        const queues = await getAllGenesysItems("/api/v2/routing/queues?sortOrder=asc&sortBy=name&name=**&divisionId", 100, "entities");
        window.queueMapping = mapProperty("id", "name", queues);
        const wrapupCodes = await getAllGenesysItems("/api/v2/routing/wrapupcodes?sortBy=name&sortOrder=ascending", 100, "entities");
        window.wrapupCodeMapping = mapProperty("id", "name", wrapupCodes);
        const flows = await getAllGenesysItems("/api/v2/flows?sortBy=name&sortOrder=asc", 100, "entities");
        window.flowMapping = mapProperty("id", "name", flows);
        window.orgInfoCacheKey = orgInfoCacheKey;
    }
}

function mapProperty(propA, propB, objects) {
    const mapping = {};
    for (let object of objects) {
        mapping[object[propA]] = object[propB]
    }
    return mapping;
}

async function getOrgDetails() {
    return makeGenesysRequest(`/api/v2/organizations/me`);
}

function getParams(topic) {
    const results = [...topic.matchAll(/\{(\w+)\}/g)];
    const formattedResults = [];
    for (let result of results) {
        const formattedResult = {};
        formattedResult.replace = result[0];
        formattedResult.key = result[1];
        formattedResults.push(formattedResult);
    }
    return formattedResults;
}

function generateForm() {
    // {
    //     "name": "flowId",
    //     "label": "Flow ID: ",
    //     "type": "input",
    //     "properties": {
    //         "id": "flowId"
    //     },
    //     "dependsOn": {
    //         "fieldName": "topic",
    //         "fieldValues": [
    //             "v2.analytics.flow.{flowId}.aggregates",
    //             "v2.flows.instances.flow.{flowId}",
    //             "v2.flows.{flowId}"
    //         ]
    //     }
    // },


}

function generateField(field) {
    // {
    //     key: "flowId",
    //     name: "Flow ID",
    //     dependentValues: [
    //         "v2.analytics.flow.{flowId}.aggregates",
    //         "v2.flows.instances.flow.{flowId}",
    //         "v2.flows.{flowId}"
    //     ]
    // }
    const newField = {};

}

var allMessageIds = [];
var conversationId;
var tabs = [];
var fileContents;

runLoginProcess(showLoginPage, showMainMenu);
