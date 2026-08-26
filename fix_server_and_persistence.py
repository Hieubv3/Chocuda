import json
import os

with open('server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix the double closing brace in entity 5
bad_snippet = """        saveDataStore();
        console.log(`✅ [Payment Webhook] Matched & Credited Top-up ${topupAmount}đ for User ${u.name} (${u.id})`);
      }
    }
  }
  }

  // Record into Webhook Logs"""

good_snippet = """        saveDataStore();
        console.log(`✅ [Payment Webhook] Matched & Credited Top-up ${topupAmount}đ for User ${u.name} (${u.id})`);
      }
    }
  }

  // Record into Webhook Logs"""

if bad_snippet in text:
    text = text.replace(bad_snippet, good_snippet, 1)
    print("Fixed extra closing brace successfully in server.ts!")
else:
    print("bad_snippet not exact, searching line by line...")
    # let's look for the occurrence
    idx = text.find("Matched & Credited Top-up")
    if idx != -1:
        part = text[idx:idx+300]
        print("Found nearby part:", part)
        part_fixed = part.replace("  }\n  }\n  }\n  }", "  }\n  }\n  }")
        text = text[:idx] + part_fixed + text[idx+300:]

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Server.ts write finished.")
