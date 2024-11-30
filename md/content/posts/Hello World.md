---
title: blogtitle
date: 2024-11-06
draft: false
tags:
  - tag1
  - tag2
---
installing stuff

![pfp](/images/Pasted%20image%2020241130143836.png)




```
rsync -av --delete "/home/findirfin/vault/Publish/" "/home/findirfin/Development/findirfin.dev/md/content/posts"

```

```

import os import re import shutil # Paths posts_dir = "/home/findirfin/Development/findirfin.dev/md/content/posts/" attachments_dir = "/home/findirfin/vault/media/" static_images_dir = "/home/findirfin/Development/findirfin.dev/md/static/images/" # Step 1: Process each markdown file in the posts directory for filename in os.listdir(posts_dir): if filename.endswith(".md"): filepath = os.path.join(posts_dir, filename) with open(filepath, "r") as file: content = file.read() # Step 2: Find all image links in the format ![Description](image_path.png) images = re.findall(r'!\[.*?\]\((.*?\.png)\)', content) for image in images: # Extract just the filename part if there's a path image_name = os.path.basename(image) image_source = os.path.join(attachments_dir, image_name) if os.path.exists(image_source): # Copy the image to the Hugo static/images directory shutil.copy(image_source, static_images_dir) # Replace the path in markdown with the new static path new_image_path = f"/images/{image_name.replace(' ', '%20')}" content = content.replace(image, new_image_path) else: print(f"Warning: Image {image} not found at {image_source}") # Step 5: Write the updated content back to the markdown file with open(filepath, "w") as file: file.write(content) print("Markdown files processed and images copied successfully.")


```





based based based


cool?
![](/images/Pasted%20image%2020241130150203.png)




testing testing