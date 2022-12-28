import { APIBaseInteraction, InteractionType } from 'discord-api-types/v10';
import { verifyKey } from 'discord-interactions';
import { IRequest } from 'itty-router';

const verifyInteraction = async (req: IRequest, publicKey: string) => {
  const signature = req.headers.get('x-signature-ed25519');
  const timestamp = req.headers.get('x-signature-timestamp');
  if (!signature || !timestamp) return false;
  const body = await req.clone().arrayBuffer();
  return verifyKey(body, signature, timestamp, publicKey);
}

const handleInteraction = async (req: IRequest, publicKey: string) => {
  const interaction = await req.json();

  if(!verifyInteraction(req, publicKey)) return new Response('Unable to authorize interaction.', { status: 401 });

  /*
  if(interaction.type === InteractionType.ApplicationCommand) {
    // Command
    
  }
  */

  return new Response(JSON.stringify({ type: InteractionType.Ping }), { status: 200 });
}

export default handleInteraction;