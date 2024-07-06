import Avatar from '@/components/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React from 'react';

function CreateChatbot() {
  return (
    <div className="flex flex-col items-center justify-center md:flex-row md:space-x-10 bg-white p-10 rounded-md m-10">
      <Avatar seed="create-chatbot" />
      <div>
        <h1 className="text-xl lg:text-3xl font-semibold">Create</h1>
        <h2 className="font-light">
          Create a chatbot to engage your customers.
        </h2>

        <form className="flex flex-col md:flex-row gap-5 mt-5">
          <Input
            placeholder="Enter Chatbot name"
            type="text"
            className="max-w-lg"
            required
          />
          <Button>Create Chatbot</Button>
        </form>
      </div>
    </div>
  );
}

export default CreateChatbot;