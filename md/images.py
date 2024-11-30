import os
import re
import shutil
import subprocess

# Paths
posts_dir = "/home/findirfin/Development/findirfin.dev/md/content/posts/"
attachments_dir = "/home/findirfin/vault/media/"
static_images_dir = "/home/findirfin/Development/findirfin.dev/md/static/images/"
publish_dir = "/home/findirfin/vault/Publish/"
hugo_dir = "/home/findirfin/Development/findirfin.dev/md/"

# Function to sync posts
def sync_posts():
    try:
        subprocess.run([
            'rsync', '-av', '--delete', 
            publish_dir, 
            os.path.join(posts_dir, '')
        ], check=True)
        print("Posts synced successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error syncing posts: {e}")

# Process each markdown file in the posts directory
def process_markdown_files():
    for filename in os.listdir(posts_dir):
        if filename.endswith(".md"):
            filepath = os.path.join(posts_dir, filename)
            
            with open(filepath, "r") as file:
                content = file.read()
            
            # Find all image links in the format ![Description](image_path.png)
            images = re.findall(r'!\[.*?\]\((.*?\.png)\)', content)
            
            for image in images:
                # Extract just the filename part if there's a path
                image_name = os.path.basename(image).replace('%20', ' ')  # Convert %20 back to space for matching
                
                image_source = os.path.join(attachments_dir, image_name)
                
                if os.path.exists(image_source):
                    # Copy the image to the Hugo static/images directory
                    shutil.copy(image_source, static_images_dir)
                    
                    # Replace the path in markdown with the new static path
                    new_image_path = f"/images/{image_name.replace(' ', '%20')}"
                    content = content.replace(image, new_image_path)
                else:
                    print(f"Warning: Image {image} not found at {image_source}")

            # Write the updated content back to the markdown file
            with open(filepath, "w") as file:
                file.write(content)

    print("Markdown files processed and images copied successfully.")

# Build Hugo site
def build_hugo():
    try:
        subprocess.run(['hugo', '--destination=.'], check=True, cwd=hugo_dir)
        print("Hugo site built successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error building Hugo site: {e}")

# Commit and Push Changes
def git_commit_and_push():
    try:
        # Add all changes
        subprocess.run(['git', 'add', '.'], check=True, cwd=hugo_dir)
        
        # Commit changes
        commit_message = "Update site content and images"
        subprocess.run(['git', 'commit', '-m', commit_message], check=True, cwd=hugo_dir)
        
        # Push to remote repository
        subprocess.run(['git', 'push'], check=True, cwd=hugo_dir)
        print("Changes committed and pushed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error with Git operations: {e}")

# Main execution
if __name__ == "__main__":
    sync_posts()
    process_markdown_files()
    build_hugo()
    git_commit_and_push()