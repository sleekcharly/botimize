import { GET_MESSAGES_BY_CHAT_SESSION_ID } from './../graphql/queries/queries';
import { serverClient } from '@/lib/server/serverClient';
import {
  GetChatbotByIdResponse,
  MessagesByChatSessionIdResponse,
} from '@/types/types';
import { NextRequest, NextResponse } from 'next/server';

import OpenAI from 'openai';
import { GET_CHATBOT_BY_ID } from '../graphql/queries/queries';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { INSERT_MESSAGE } from '../graphql/mutations/mutations';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export async function POST(req: NextRequest) {
  const { chat_session_id, chatbot_id, content, name } = await req.json();

  console.log(
    `Received message from chat session ${chat_session_id}: ${content} (chatbot: ${chatbot_id})`,
  );

  try {
    // step 1: Fetch chatbot characteristics
    const { data } = await serverClient.query<GetChatbotByIdResponse>({
      query: GET_CHATBOT_BY_ID,
      variables: { id: chatbot_id },
    });

    const chatbot = data.chatbots;

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    // step2: Fetch previous messages
    const { data: messagesData } =
      await serverClient.query<MessagesByChatSessionIdResponse>({
        query: GET_MESSAGES_BY_CHAT_SESSION_ID,
        variables: { chat_session_id },
        fetchPolicy: 'no-cache',
      });

    const previousMessages = messagesData.chat_sessions.messages;

    const formattedPreviousMessages: ChatCompletionMessageParam[] =
      previousMessages.map((message) => ({
        role: message.sender === 'ai' ? 'system' : 'user',
        name: message.sender === 'ai' ? 'system' : name,
        content: message.content,
      }));

    // combine characteristics into a single prompt
    const systemPrompt = chatbot.chatbot_characteristics
      .map((c) => c.content)
      .join(' + ');

    console.log(systemPrompt);

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        name: 'system',
        content: `You are a helpful assistant talking to ${name}. If a generic question is asked which is not relevant or in the same scope or domain as the points in mentioned in the key information section, kindly inform the user they're only allowed to search for the specified content. Use Emoji's where possible. Here is some key information that you need to be aware of, these are elements you may be asked about: ${systemPrompt}`,
      },
      ...formattedPreviousMessages,
      {
        role: 'user',
        name: name,
        content: content,
      },
    ];

    // step 3: Send the message to OpenAi's completions API
    const openaiResponse = await openai.chat.completions.create({
      messages: messages,
      model: 'gpt-3.5-turbo',
    });

    const aiResponse = openaiResponse?.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'Failed to generate AI Response' },
        { status: 500 },
      );
    }

    // step 4. Save the user's message in the database
    await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: {
        chat_session_id,
        content,
        sender: 'user',
        created_at: new Date().toISOString(),
      },
    });

    // step 5. Save the AI's response in the database
    const aiMessageResult = await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: {
        chat_session_id,
        content: aiResponse,
        sender: 'ai',
        created_at: new Date().toISOString(),
      },
    });

    // step 6. Return the AI's response to the client
    return NextResponse.json({
      id: aiMessageResult.data.insertMessages.id,
      content: aiResponse,
    });
  } catch (err) {
    console.error('Error sending message: ', err);
    return NextResponse.json({ err }, { status: 500 });
  }
}
