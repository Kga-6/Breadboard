import json

INPUT_FILE = "C:/Users/Kevin/Desktop/Project/bibles.json"
OUTPUT_FILE = "C:/Users/Kevin/Desktop/Project/languages.json"  # 👈 output file for unique languages

def extract_languages():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        bibles_data = json.load(f)

    bibles = bibles_data.get("data", [])

    language_map = {}

    for bible in bibles:
        lang = bible.get("language", {})
        lang_id = lang.get("id")

        if lang_id and lang_id not in language_map:
            language_map[lang_id] = {
                "id": lang_id,
                "name": lang.get("name"),
                "nameLocal": lang.get("nameLocal"),
                "script": lang.get("script"),
                "scriptDirection": lang.get("scriptDirection")
            }

    return list(language_map.values())

def save_to_json(languages):
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(languages, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved {len(languages)} unique languages to {OUTPUT_FILE}")

def main():
    print("🧠 Extracting languages from local file...")
    languages = extract_languages()
    save_to_json(languages)

if __name__ == "__main__":
    main()
