#!/usr/bin/env python3
"""
Generates an interactive, styled HTML version of the AirGuard Comprehensive Project Report.
Uses GitHub-style academic typography, responsive design, clean tables, KaTeX, and Mermaid.js support.
"""

import os
import re

def markdown_to_html(md_text):
    html_lines = []
    in_code_block = False
    code_lang = ""
    code_lines = []
    in_table = False
    table_lines = []

    def flush_table(lines):
        if not lines:
            return ""
        out = ["<div class='table-container'><table>"]
        is_header = True
        for line in lines:
            if re.match(r'^\s*\|?\s*[-:]+[-| :]*$', line):
                is_header = False
                continue
            cells = [c.strip() for c in line.strip('| \n').split('|')]
            tag = "th" if is_header else "td"
            out.append("<tr>" + "".join(f"<{tag}>{c}</{tag}>" for c in cells) + "</tr>")
        out.append("</table></div>")
        return "\n".join(out)

    lines = md_text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]

        # Fenced code blocks
        if line.strip().startswith("```"):
            if in_code_block:
                in_code_block = False
                code_content = "\n".join(code_lines)
                if code_lang == "mermaid":
                    html_lines.append(f"<div class='mermaid'>\n{code_content}\n</div>")
                else:
                    html_lines.append(f"<pre><code class='language-{code_lang}'>{code_content}</code></pre>")
                code_lines = []
                code_lang = ""
            else:
                if in_table:
                    html_lines.append(flush_table(table_lines))
                    table_lines = []
                    in_table = False
                in_code_block = True
                code_lang = line.strip().lstrip("`").strip()
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Tables
        if "|" in line and (line.strip().startswith("|") or line.strip().endswith("|")):
            in_table = True
            table_lines.append(line)
            i += 1
            continue
        elif in_table:
            html_lines.append(flush_table(table_lines))
            table_lines = []
            in_table = False

        # Horizontal Rule
        if line.strip() in ["---", "***", "___"]:
            html_lines.append("<hr/>")
            i += 1
            continue

        # Headings
        m = re.match(r'^(#{1,6})\s+(.*)$', line)
        if m:
            level = len(m.group(1))
            text = m.group(2).strip()
            slug = re.sub(r'[^a-zA-Z0-9_-]', '-', text.lower()).strip('-')
            html_lines.append(f"<h{level} id='{slug}'>{text}</h{level}>")
            i += 1
            continue

        # Blockquotes / Callouts
        if line.startswith(">"):
            quote_text = line.lstrip("> ").strip()
            html_lines.append(f"<blockquote><p>{quote_text}</p></blockquote>")
            i += 1
            continue

        # List items
        if re.match(r'^\s*[-*+]\s+', line):
            text = re.sub(r'^\s*[-*+]\s+', '', line).strip()
            # bold, italic, code inline
            text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
            text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
            text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
            html_lines.append(f"<li>{text}</li>")
            i += 1
            continue

        # Numbered list
        m_num = re.match(r'^\s*(\d+)\.\s+(.*)$', line)
        if m_num:
            text = m_num.group(2).strip()
            text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
            text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
            text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
            html_lines.append(f"<li>{text}</li>")
            i += 1
            continue

        # Paragraph
        if line.strip():
            text = line.strip()
            text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
            text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
            text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
            html_lines.append(f"<p>{text}</p>")
        else:
            html_lines.append("")

        i += 1

    if in_table:
        html_lines.append(flush_table(table_lines))

    return "\n".join(html_lines)


def build_full_html():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    md_path = os.path.join(base_dir, "AirGuard_Comprehensive_Project_Report.md")
    html_path = os.path.join(base_dir, "AirGuard_Comprehensive_Project_Report.html")

    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    body_html = markdown_to_html(md_text)

    full_page = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AirGuard — Comprehensive Software Project Report</title>
    <style>
        :root {{
            --primary: #1e3a8a;
            --secondary: #2563eb;
            --text-dark: #0f172a;
            --text-muted: #475569;
            --bg-light: #f8fafc;
            --border-color: #cbd5e1;
        }}
        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: var(--text-dark);
            background-color: #f1f5f9;
            line-height: 1.6;
            padding: 40px 20px;
        }}
        .report-container {{
            max-width: 900px;
            margin: 0 auto;
            background: #ffffff;
            padding: 60px 80px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: 1px solid var(--border-color);
        }}
        h1 {{
            color: var(--primary);
            font-size: 26px;
            line-height: 1.3;
            margin-bottom: 8px;
            text-align: center;
        }}
        h2 {{
            color: var(--secondary);
            font-size: 18px;
            margin-top: 32px;
            margin-bottom: 12px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 6px;
        }}
        h3 {{
            color: var(--primary);
            font-size: 15px;
            margin-top: 20px;
            margin-bottom: 8px;
        }}
        p {{
            margin-bottom: 14px;
            text-align: justify;
            font-size: 14.5px;
        }}
        hr {{
            border: none;
            border-top: 1.5px solid #cbd5e1;
            margin: 24px 0;
        }}
        ul, ol {{
            margin-left: 24px;
            margin-bottom: 14px;
            font-size: 14.5px;
        }}
        li {{
            margin-bottom: 6px;
        }}
        .table-container {{
            overflow-x: auto;
            margin: 20px 0;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 13.5px;
            margin-bottom: 10px;
        }}
        th, td {{
            border: 1px solid var(--border-color);
            padding: 8px 12px;
            text-align: left;
        }}
        th {{
            background-color: var(--primary);
            color: #ffffff;
            font-weight: 600;
            text-align: center;
        }}
        tr:nth-child(even) {{
            background-color: var(--bg-light);
        }}
        pre {{
            background-color: #0f172a;
            color: #f8fafc;
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 13px;
            margin: 16px 0;
            line-height: 1.45;
        }}
        code {{
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
            background: #e2e8f0;
            padding: 2px 5px;
            border-radius: 4px;
            font-size: 13px;
        }}
        pre code {{
            background: transparent;
            padding: 0;
            color: #f8fafc;
        }}
        blockquote {{
            border-left: 4px solid var(--secondary);
            background: #eff6ff;
            padding: 12px 18px;
            margin: 16px 0;
            border-radius: 0 4px 4px 0;
            font-size: 14px;
        }}
        .badge {{
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }}
        @media print {{
            body {{
                padding: 0;
                background: white;
            }}
            .report-container {{
                box-shadow: none;
                border: none;
                padding: 0;
                max-width: 100%;
            }}
        }}
    </style>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        document.addEventListener("DOMContentLoaded", function() {{
            if (typeof mermaid !== "undefined") {{
                mermaid.initialize({{ startOnLoad: true, theme: 'neutral' }});
            }}
        }});
    </script>
</head>
<body>
    <div class="report-container">
        {body_html}
    </div>
</body>
</html>
"""

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(full_page)

    print(f"HTML report successfully generated at: {html_path}")

if __name__ == "__main__":
    build_full_html()
