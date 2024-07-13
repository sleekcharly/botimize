'use client';

import Avatar from '@/components/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BASE_URL } from '@/graphql/apolloClient';
import { useMutation, useQuery } from '@apollo/client';
import { Copy } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { GET_CHATBOT_BY_ID } from '@/app/api/graphql/queries/queries';
import { GetChatbotByIdResponse, GetChatbotByIdVariables } from '@/types/types';
import Characteristic from '@/components/Characteristic';
import {
  ADD_CHARACTERISTIC,
  DELETE_CHATBOT,
  UPDATE_CHATBOT,
} from '@/app/api/graphql/mutations/mutations';
import { redirect } from 'next/navigation';

function EditChatbot({ params: { id } }: { params: { id: string } }) {
  const [url, setUrl] = useState<string>('');

  const [newCharacteristic, setNewCharacteristic] = useState<string>('');

  const [chatbotName, setChatbotName] = useState<string>('');

  /**
   * Mutations
   */
  const [deleteChatbot] = useMutation(DELETE_CHATBOT, {
    refetchQueries: ['GetChatbotById'], // refetch the chatbots after deleting
    awaitRefetchQueries: true,
  });
  const [addCharacteristic] = useMutation(ADD_CHARACTERISTIC, {
    refetchQueries: ['GetChatbotById'],
  });
  // mutation for updating chatbot
  const [updateChatbot] = useMutation(UPDATE_CHATBOT, {
    refetchQueries: ['GetChatbotById'],
  });

  const { data, loading, error } = useQuery<
    GetChatbotByIdResponse,
    GetChatbotByIdVariables
  >(GET_CHATBOT_BY_ID, { variables: { id } });

  useEffect(() => {
    if (data) {
      setChatbotName(data.chatbots.name);
    }
  }, [data]);

  useEffect(() => {
    const url = `${BASE_URL}/chatbot/${id}`;

    setUrl(url);
  }, [id]);

  const handleAddCharacteristic = async (content: string) => {
    try {
      const createdAt = new Date();

      const promise = addCharacteristic({
        variables: {
          chatbotId: Number(id),
          content,
          created_at: createdAt.toISOString(),
        },
      });

      toast.promise(promise, {
        loading: 'Adding...',
        success: 'Information added',
        error: 'Failed to add Information',
      });
    } catch (err) {
      console.error('Failed to add characteristic:', err);
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this chatbot?',
    );

    if (!isConfirmed) return;

    try {
      const promise = deleteChatbot({ variables: { id } });
      toast.promise(promise, {
        loading: 'Deleting...',
        success: 'Chatbot Successfully deleted',
        error: 'Failed to delete chatbot',
      });
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      toast.error('Failed to delete chatbot');
    }
  };

  const handleUpdateChatbot = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const promise = updateChatbot({
        variables: {
          id,
          name: chatbotName,
        },
      });

      toast.promise(promise, {
        loading: 'Updating...',
        success: 'Chatbot Name Successfully updated!',
        error: 'Failed to update chatbot',
      });
    } catch (err) {
      console.error('Failed to update chatbot:', err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto animate-spin p-10">
        <Avatar seed="Botimize Support agent" />
      </div>
    );
  }

  if (error) return <p>Error: {error.message}</p>;

  if (!data?.chatbots) return redirect('/view-chatbots');

  return (
    <div className="px-0 md:p-10">
      <div className="md:sticky md:top-0 z-50 sm:max-w-sm ml-auto space-y-2 md:border p-5 rounded-b-lg md:rounded-lg bg-[#c46477]">
        <h2 className="text-white text-sm font-bold">Link to Chat</h2>
        <p className="text-sm italic text-white">
          Share this link with your customers to start conversations with your
          chatbot
        </p>

        <div className="flex items-center space-x-2">
          <Link href={url} className="w-full cursor-pointer hover:opacity-50">
            <Input value={url} readOnly className="cursor-pointer" />
          </Link>
          <Button
            size="sm"
            className="px-3"
            onClick={() => {
              navigator.clipboard.writeText(url);
              //   toast
              toast.success('Copied to clipboard');
            }}
          >
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <section className="relative bg-white mt-5 p-5 md:p-10 rounded-lg">
        <Button
          variant="destructive"
          className="absolute top-2 right-2 h-8 w-2"
          onClick={() => handleDelete(id)}
        >
          X
        </Button>

        <div className="flex space-x-4">
          <Avatar seed={chatbotName} />
          <form
            onSubmit={handleUpdateChatbot}
            className="flex flex-1 space-x-2 items-center"
          >
            <Input
              value={chatbotName}
              onChange={(e) => setChatbotName(e.target.value)}
              placeholder={chatbotName}
              className="w-full border-none bg-transparent text-xl font-bold"
              required
            />

            <Button type="submit" disabled={!chatbotName}>
              Update
            </Button>
          </form>
        </div>

        <h2 className="text-xl font-bold mt-10">Heres what your AI knows...</h2>
        <p>
          Your chatbot is equipped with the following information to assist you
          in your conversations with your customers & users
        </p>

        <div className="bg-gray-200 p-5 md:p-5 rounded-md mt-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Add new characteristic to the chatbot
              //...
              handleAddCharacteristic(newCharacteristic);
              setNewCharacteristic('');
            }}
            className="flex space-x-2 mb-5"
          >
            <Input
              type="text"
              placeholder="Example: If customer asks for prices, provide pricing page: www.example.com/pricing"
              value={newCharacteristic}
              onChange={(e) => setNewCharacteristic(e.target.value)}
            />
            <Button type="submit" disabled={!newCharacteristic}>
              Add
            </Button>
          </form>

          <ul className="flex flex-wrap-reverse gap-5">
            {data?.chatbots?.chatbot_characteristics?.map((characteristic) => (
              <Characteristic
                key={characteristic.id}
                characteristic={characteristic}
              />
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default EditChatbot;
