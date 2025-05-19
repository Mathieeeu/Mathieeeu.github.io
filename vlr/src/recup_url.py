from bs4 import BeautifulSoup
import requests

# Load the HTML content
url = "https://www.vlr.gg/vct-2022"
response = requests.get(url)
html_content = response.content

# Parse the HTML content
soup = BeautifulSoup(html_content, 'html.parser')

# Find all event links for 2022
event_links_2022 = []
for link in soup.find_all('a', href=True):
    href = link['href']
    if '/event/' in href:
        event_id = href.split('/')[-2]
        event_name = href.split('/')[-1]
        event_links_2022.append(f"https://www.vlr.gg/event/stats/{event_id}/{event_name}")

# Display the URLs for 2022 events
urls_2022 = list(set(event_links_2022))

for url in urls_2022:
    print(f"\"{url}\",")
print(f"Total events found: {len(urls_2022)}")