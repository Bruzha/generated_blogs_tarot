// api/ai-assistant/routes/content-plan

import { NextRequest, NextResponse } from "next/server";
import { openai } from '../Assistant';

// export async function POST(req: NextRequest) {
//   try {
//     const { prompt } = await req.json();
//     const assistantId = process.env.CROCODE_ASSISTANT_ID || null;
// console.log("assistantId: ", assistantId)
//     if (!prompt || !assistantId) {
//       return NextResponse.json({ error: "Prompt or assistantId missing" }, { status: 400 });
//     }

//     const thread = await openai.beta.threads.create();
//     await openai.beta.threads.messages.create(thread.id, { role: "user", content: prompt });

//     let run = await openai.beta.threads.runs.create(thread.id, { assistant_id: assistantId });

//     const timeoutMs = 60000;
//     const startTime = Date.now();

//     while (run.status !== "completed" && Date.now() - startTime < timeoutMs) {
//       // ⬇️ Обработка функций, если ассистент вызывает их
//       if (run.status === "requires_action" && run.required_action?.type === "submit_tool_outputs") {
//         const toolCalls = run.required_action.submit_tool_outputs.tool_calls;

//         const toolOutputs = await Promise.all(
//           toolCalls.map(async (toolCall) => {
//             if (toolCall.function.name === "getCurrentDate") {
//               const today = new Date().toISOString().split("T")[0]; // "2025-08-12"
//               return {
//                 tool_call_id: toolCall.id,
//                 output: JSON.stringify({ date: today }),
//               };
//             }

//             // Можно вернуть ошибку для неизвестных функций
//             return {
//               tool_call_id: toolCall.id,
//               output: JSON.stringify({ error: "Unknown function name" }),
//             };
//           })
//         );

//         // Отправляем результаты функций обратно
//         await openai.beta.threads.runs.submitToolOutputs(run.id, {
//           tool_outputs: toolOutputs,
//           thread_id: thread.id,
//         });

//       }

//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       run = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });

//       if (["failed", "cancelled", "expired"].includes(run.status)) {
//         return NextResponse.json({ error: `Run failed: ${run.status}` }, { status: 500 });
//       }
//     }

//     // Получение финального ответа
//     const messages = await openai.beta.threads.messages.list(thread.id);
//     const assistantMessages = messages.data.filter((m) => m.role === "assistant");
// console.log("messages: ", messages)
//     let text = "";
//     for (const msg of assistantMessages) {
//       for (const content of msg.content) {
//         if (content.type === "text") {
//           text += content.text.value + "\n";
//         }
//       }
//     }

//     return NextResponse.json({ result: { text: text.trim() } });
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
//   }
// }

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const assistantId = process.env.CROCODE_ASSISTANT_ID || null;

    console.log("⏳ Получен запрос. Prompt:", prompt);
    console.log("🧠 Assistant ID:", assistantId);

    if (!prompt || !assistantId) {
      console.error("❌ Ошибка: отсутствует prompt или assistantId");
      return NextResponse.json({ error: "Prompt or assistantId missing" }, { status: 400 });
    }

    // 🧵 Создание thread
    console.log("🔧 Создаём thread...");
    const thread = await openai.beta.threads.create();
    console.log("✅ Thread создан:", thread.id);

    // 📨 Отправляем сообщение от пользователя
    await openai.beta.threads.messages.create(thread.id, { role: "user", content: prompt });
    console.log("📨 Сообщение отправлено в thread");

    // ▶️ Запуск run
    let run = await openai.beta.threads.runs.create(thread.id, { assistant_id: assistantId });
    console.log("🚀 Run запущен:", run.id);

    const timeoutMs = 60000;
    const startTime = Date.now();

    while (run.status !== "completed" && Date.now() - startTime < timeoutMs) {
      console.log("⏱️ Ожидание завершения run... Текущий статус:", run.status);

      if (run.status === "requires_action" && run.required_action?.type === "submit_tool_outputs") {
        const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
        console.log("🔧 Ассистент требует выполнения функций:", toolCalls.map(t => t.function.name));

        const toolOutputs = await Promise.all(
          toolCalls.map(async (toolCall) => {
            if (toolCall.function.name === "getCurrentDate") {
              const today = new Date().toISOString().split("T")[0];
              return {
                tool_call_id: toolCall.id,
                output: JSON.stringify({ date: today }),
              };
            }

            return {
              tool_call_id: toolCall.id,
              output: JSON.stringify({ error: "Unknown function name" }),
            };
          })
        );

        console.log("📤 Отправляем результаты функций:", toolOutputs);

        await openai.beta.threads.runs.submitToolOutputs(run.id, {
          tool_outputs: toolOutputs,
          thread_id: thread.id,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        run = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
      } catch (retrieveError) {
        console.error("❌ Ошибка при получении статуса run:", retrieveError);
        return NextResponse.json({ error: "Failed to retrieve run status" }, { status: 500 });
      }

      if (["failed", "cancelled", "expired"].includes(run.status)) {
        console.error("❌ Run завершился с ошибкой:", run.status);
        console.error("🪵 Подробности ошибки:", run.last_error);
        return NextResponse.json(
          { error: `Run failed: ${run.status}`, details: run.last_error },
          { status: 500 }
        );
      }
    }

    // 📬 Получение финальных сообщений
    console.log("📥 Получаем сообщения от ассистента...");
    const messages = await openai.beta.threads.messages.list(thread.id);
    console.log("📨 Все сообщения:", JSON.stringify(messages, null, 2));

    const assistantMessages = messages.data.filter((m) => m.role === "assistant");

    let text = "";
    for (const msg of assistantMessages) {
      if (!msg.content) continue;
      for (const content of msg.content) {
        if (content.type === "text") {
          text += content.text.value + "\n";
        }
      }
    }

    console.log("✅ Ответ ассистента получен:", text.trim());

    return NextResponse.json({ result: { text: text.trim() } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("💥 Общая ошибка на сервере:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
