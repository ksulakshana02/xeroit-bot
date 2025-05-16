// import OpenAI from "openai";
// import {Pinecone, IndexList, ScoredPineconeRecord, RecordMetadata} from "@pinecone-database/pinecone";
// import "dotenv/config";
// import {Request as ExpressRequest, Response} from "express";
// import {OperationUsage} from "@pinecone-database/pinecone/dist/data/types";
//
// const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
// if (
//     !process.env.PINECONE_API_KEY ||
//     typeof process.env.PINECONE_API_KEY !== "string"
// ) {
//     throw new Error("Pinecone API key is not defined or is not a string.");
// }
// const pc = new Pinecone({apiKey: process.env.PINECONE_API_KEY});
//
// type OpenAIMessage = {
//     role: "user" | "assistant" | "system";
//     content: string;
//     name?: string;
// };
//
// interface RequestWithChatId extends ExpressRequest {
//     userChatId?: string;
// }
//
// interface ChatEntry {
//     role: string;
//     content: string;
// }
//
// interface CompanyDataMetadata {
//     Title?: string
//     Text?: string
// }
//
// export const chatResponseTrigger = async (req: RequestWithChatId, res: Response) => {
//     try {
//         let userChatId = req.body.chatId || generateChatId();
//         let clientDetailsSubmitStatus = req.body.clientDetailsSubmitStatus;
//
//         // Verify index exists
//         const indexesResult: IndexList = await pc.listIndexes();
//         const indexesArray = Array.isArray(indexesResult)
//             ? indexesResult
//             : "indexes" in indexesResult && Array.isArray(indexesResult.indexes)
//                 ? indexesResult.indexes
//                 : [];
//         const indexExists = indexesArray.some((index) => index.name === "company-data");
//
//         if (!indexExists) {
//             console.error("Pinecone index 'company-data' does not exist.");
//             return res.status(500).json({error: "Pinecone index 'company-data' does not exist. Please create it."});
//         }
//
//         const index = pc.index("company-data");
//         const namespaceName = process.env.PINECONE_NAMESPACE || "";
//         const namespace = index.namespace(namespaceName);
//
//         let chatHistory: OpenAIMessage[] = req.body.messages || [];
//         const userQuestion = extractLastUserMessage(chatHistory);
//
//         if (!userQuestion) {
//             return res.status(400).json({error: "No user message found."});
//         }
//
//         updateUserMessage(chatHistory, userQuestion);
//
//         const embedding = await openai.embeddings.create({
//             model: "text-embedding-ada-002",
//             input: userQuestion,
//         });
//
//         let queryResponse: { matches: any; namespace?: string; usage?: OperationUsage | undefined; };
//
//         queryResponse = await namespace.query({
//             vector: embedding.data[0].embedding,
//             topK: 5,
//             includeMetadata: true,
//         });
//
//         // Debug: Log query results
//         console.log("Pinecone query results:", queryResponse);
//
//         const results: string[] = [];
//         queryResponse.matches.forEach((match: { metadata: { Title: any; Text: any; }; }) => {
//             if (match.metadata && typeof match.metadata.Title === "string") {
//                 const result = `Title: ${match.metadata.Title}, \n  Content: ${match.metadata.Text} \n \n `;
//                 results.push(result);
//             }
//         });
//
//
//         let context = results.join("\n");
//         console.log("context:", context);
//
// //         const embedding = await openai.embeddings.create({
// //             model: "text-embedding-ada-002",
// //             input: userQuestion,
// //         });
// //
// //         let queryResponse = await namespace.query({
// //             vector: embedding.data[0].embedding,
// //             topK: 2,
// //             includeMetadata: true,
// //         });
// //
// // // Filter matches with a minimum similarity score (e.g., 0.8) and valid metadata
// //         const results: string[] = [];
// //         queryResponse.matches.forEach((match: { score: number; metadata?: { Title?: string; Text?: string } }) => {
// //             if (match.score >= 0.8 && match.metadata && match.metadata.Title && match.metadata.Text) {
// //                 const result = `Title: ${match.metadata.Title}\nContent: ${match.metadata.Text}\n\n`;
// //                 results.push(result);
// //             }
// //         });
// //
// //         let context = results.join("\n") || "No relevant information found.";
// //         console.log("Context:", context);
//
// //         const embedding = await openai.embeddings.create({
// //             model: "text-embedding-ada-002",
// //             input: userQuestion,
// //         });
// //
// //         let queryResponse = await namespace.query({
// //             vector: embedding.data[0].embedding,
// //             topK: 10,
// //             includeMetadata: true,
// //         });
// //
// // // Process query results
// //         const results: string[] = [];
// //         queryResponse.matches.forEach((match: ScoredPineconeRecord<RecordMetadata>) => {
// //             if (
// //                 match.score != null &&
// //                 match.score >= 0.6 &&
// //                 match.metadata &&
// //                 "Title" in match.metadata &&
// //                 "Text" in match.metadata &&
// //                 typeof match.metadata.Title === "string" &&
// //                 typeof match.metadata.Text === "string"
// //             ) {
// //                 const result = `Title: ${match.metadata.Title}\nContent: ${match.metadata.Text}\n\n`;
// //                 results.push(result);
// //             }
// //         });
// //
// //         let context = results.join("\n") || "No relevant information found.";
// //         console.log("Context:", context);
//
//         chatHistory = formatChatHistory(chatHistory, context, clientDetailsSubmitStatus, userQuestion);
//
//         console.log("======================================= ");
//         console.log("chatHistory:", chatHistory);
//
//         const completion = await openai.chat.completions.create({
//             messages: chatHistory,
//             model: "gpt-4o-mini",
//             max_tokens: 300,
//             temperature: 0.2,
//         });
//
//         const botResponse = completion.choices[0]?.message.content?.trim() || "No response from model.";
//         console.log("botResponse:", botResponse);
//         chatHistory.push({role: "assistant", content: botResponse});
//
//         res.json({
//             answer: botResponse,
//             chatHistory,
//             chatId: userChatId,
//         });
//     } catch (error: any) {
//         console.error("Error processing question:", error.message, error.stack);
//         const errorMessage = error.message || "An error occurred.";
//         res.status(500).json({error: errorMessage});
//     }
// };
//
// function generateChatId() {
//     const currentDate = new Date();
//     const formatDate = (unit: number) => `0${unit}`.slice(-2);
//     const prefix = "chat";
//     return `${prefix}_${currentDate.getFullYear()}${formatDate(currentDate.getMonth() + 1)}${formatDate(currentDate.getDate())}_${formatDate(currentDate.getHours())}${formatDate(currentDate.getMinutes())}${formatDate(currentDate.getSeconds())}`;
// }
//
// function extractLastUserMessage(chatHistory: OpenAIMessage[]): string {
//     for (let i = chatHistory.length - 1; i >= 0; i--) {
//         if (chatHistory[i].role === "user") {
//             return chatHistory[i].content;
//         }
//     }
//     return "";
// }
//
// function updateUserMessage(chatHistory: OpenAIMessage[], userQuestion: string) {
//     const lastUserIndex = chatHistory.map(entry => entry.role).lastIndexOf("user");
//     if (lastUserIndex !== -1) {
//         chatHistory[lastUserIndex].content = userQuestion;
//     }
// }
//
// function formatChatHistory(chatHistory: OpenAIMessage[], context: string, clientDetailsSubmitStatus: boolean, userQuestion: string): OpenAIMessage[] {
//     const message1 = "Sorry, no information was found in the provided context.";
//     const message2 = "Sorry, I can't provide that information.";
//
//     console.log("clientDetailsSubmitStatus:", clientDetailsSubmitStatus);
//     const conversationHistory = chatHistory
//         .filter(msg => msg.role !== "system")
//         .slice(-5);
//
//     // const sysPrompt: OpenAIMessage = {
//     //     role: "system",
//     //     content: 'You are a helpful chatbot for Xeroit. Respond only using the provided context from our records. Do not generate answers from external knowledge or assumptions. Maintain a smooth and helpful experience for the user at all times.',
//     // };
//
//     const sysPrompt: OpenAIMessage = {
//         role: "system",
//         content: `You are XeroitBot, the official AI assistant for Xeroit. Follow these strict guidelines:
//
// 1. ONLY use information from the "RETRIEVED INFORMATION" section above
// 2. If no relevant information exists, respond with: "I don't have access to that specific information."
// 3. Verify every fact against the provided context before responding
// 4. Structure responses with clear headings and bullet points when appropriate
// 5. Maintain professional tone while being concise and helpful
// 6. For technical questions, provide step-by-step explanations when relevant
//
// Current User Question: "${userQuestion}"
//
// Context Used: ${context}`
//     };
//
//     return [sysPrompt, ...conversationHistory];
// }


import OpenAI from "openai";
import {Pinecone, IndexList} from "@pinecone-database/pinecone";
import "dotenv/config";
import {Request as ExpressRequest, Response} from "express";
import {OperationUsage} from "@pinecone-database/pinecone/dist/data/types";

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
if (
    !process.env.PINECONE_API_KEY ||
    typeof process.env.PINECONE_API_KEY !== "string"
) {
    throw new Error("Pinecone API key is not defined or is not a string.");
}
const pc = new Pinecone({apiKey: process.env.PINECONE_API_KEY});

type OpenAIMessage = {
    role: "user" | "assistant" | "system";
    content: string;
    name?: string;
};

interface RequestWithChatId extends ExpressRequest {
    userChatId?: string;
}

interface ChatEntry {
    role: string;
    content: string;
}

export const chatResponseTrigger = async (req: RequestWithChatId, res: Response) => {
    try {
        let userChatId = req.body.chatId || generateChatId();
        let clientDetailsSubmitStatus = req.body.clientDetailsSubmitStatus;

        // Verify index exists
        const indexesResult: IndexList = await pc.listIndexes();
        const indexesArray = Array.isArray(indexesResult)
            ? indexesResult
            : "indexes" in indexesResult && Array.isArray(indexesResult.indexes)
                ? indexesResult.indexes
                : [];
        const indexExists = indexesArray.some((index) => index.name === "company-data");

        if (!indexExists) {
            console.error("Pinecone index 'company-data' does not exist.");
            return res.status(500).json({error: "Pinecone index 'company-data' does not exist. Please create it."});
        }

        const index = pc.index("company-data");
        const namespaceName = process.env.PINECONE_NAMESPACE || "";
        const namespace = index.namespace(namespaceName);

        let chatHistory: OpenAIMessage[] = req.body.messages || [];
        const userQuestion = extractLastUserMessage(chatHistory);

        if (!userQuestion) {
            return res.status(400).json({error: "No user message found."});
        }

        updateUserMessage(chatHistory, userQuestion);

        const embedding = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: userQuestion,
        });

        let queryResponse: { matches: any; namespace?: string; usage?: OperationUsage | undefined; };

        queryResponse = await namespace.query({
            vector: embedding.data[0].embedding,
            topK: 2,
            includeMetadata: true,
        });

        // Debug: Log query results
        console.log("Pinecone query results:", queryResponse);

        const results: string[] = [];
        queryResponse.matches.forEach((match: { metadata: { Title: any; Text: any; }; }) => {
            if (match.metadata && typeof match.metadata.Title === "string") {
                const result = `Title: ${match.metadata.Title}, \n  Content: ${match.metadata.Text} \n \n `;
                results.push(result);
            }
        });

        let context = results.join("\n");
        console.log("context:", context);

        chatHistory = formatChatHistory(chatHistory, context, clientDetailsSubmitStatus, userQuestion);

        console.log("======================================= ");
        console.log("chatHistory:", chatHistory);

        const completion = await openai.chat.completions.create({
            messages: chatHistory,
            model: "gpt-4o-mini",
            max_tokens: 180,
            temperature: 0.2,
        });

        const botResponse = completion.choices[0]?.message.content?.trim() || "No response from model.";
        console.log("botResponse:", botResponse);
        chatHistory.push({role: "assistant", content: botResponse});

        res.json({
            answer: botResponse,
            chatHistory,
            chatId: userChatId,
        });
    } catch (error: any) {
        console.error("Error processing question:", error.message, error.stack);
        const errorMessage = error.message || "An error occurred.";
        res.status(500).json({error: errorMessage});
    }
};

function generateChatId() {
    const currentDate = new Date();
    const formatDate = (unit: number) => `0${unit}`.slice(-2);
    const prefix = "chat";
    return `${prefix}_${currentDate.getFullYear()}${formatDate(currentDate.getMonth() + 1)}${formatDate(currentDate.getDate())}_${formatDate(currentDate.getHours())}${formatDate(currentDate.getMinutes())}${formatDate(currentDate.getSeconds())}`;
}

function extractLastUserMessage(chatHistory: OpenAIMessage[]): string {
    for (let i = chatHistory.length - 1; i >= 0; i--) {
        if (chatHistory[i].role === "user") {
            return chatHistory[i].content;
        }
    }
    return "";
}

function updateUserMessage(chatHistory: OpenAIMessage[], userQuestion: string) {
    const lastUserIndex = chatHistory.map(entry => entry.role).lastIndexOf("user");
    if (lastUserIndex !== -1) {
        chatHistory[lastUserIndex].content = userQuestion;
    }
}

function formatChatHistory(chatHistory: OpenAIMessage[], context: string, clientDetailsSubmitStatus: boolean, userQuestion: string): OpenAIMessage[] {
    const message1 = "Sorry, no information was found in the provided context.";
    const message2 = "Sorry, I can't provide that information.";

    console.log("clientDetailsSubmitStatus:", clientDetailsSubmitStatus);
    const conversationHistory = chatHistory
        .filter(msg => msg.role !== "system")
        .slice(-5);

    const sysPrompt: OpenAIMessage = {
        role: "system",
        content: 'You are a helpful chatbot for Xeroit. Respond only using the provided context from our records. Do not generate answers from external knowledge or assumptions. Maintain a smooth and helpful experience for the user at all times.',
    };

    return [sysPrompt, ...conversationHistory];
}