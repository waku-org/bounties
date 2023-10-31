const https = require("https");

if (process.argv.length < 4) {
  console.error("Usage: node script.js [owner] [repo]");
  process.exit(1);
}

const owner = process.argv[2];
const repo = process.argv[3];

const query = `
{
  repository(owner: "${owner}", name: "${repo}") {
    issues(first: 100, states: OPEN) {
      nodes {
        id
        title
        url
        author {
            login
            avatarUrl
          }
        labels(first: 10) {
          nodes {
            name
          }
        }
        commentCount: comments {
            totalCount
          }
        commentsDetailed: comments(first: 10) {
        nodes {
            id
            author {
            login
            }
            body
            createdAt
        }
        }
        assignees(first: 10) {
          nodes {
            login
            avatarUrl
          }
        }
        milestone {
          title
        }
        createdAt
        updatedAt
        projectCards(first: 10) {
          nodes {
            project {
              name
              url
            }
          }
        }
      }
    }
  }
}
`;

const options = {
  hostname: "api.github.com",
  path: "/graphql",
  method: "POST",
  headers: {
    "User-Agent": "NodeJS-Script",
    Authorization: "bearer YOUR_GITHUB_TOKEN", // Note: Using bearer for GraphQL
    "Content-Type": "application/json",
  },
};

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const response = JSON.parse(data);
      console.log("Response:", response);
      const rawIssues = response.data?.repository?.issues.nodes;

      const extractedIssues = rawIssues.map((issue) => ({
        id: issue.id,
        title: issue.title,
        url: issue.url,
        user: {
          login: issue.author.login,
          avatarUrl: issue.author.avatarUrl,
        },
        labels: issue.labels.nodes.map((label) => label.name),
        commentCount: issue.commentCount.totalCount,
        comments: issue.commentsDetailed.nodes.map(comment => ({
            id: comment.id,
            author: comment.author.login,
            body: comment.body,
            createdAt: comment.createdAt
        })),
        assignees: issue.assignees.nodes,
        milestone: issue.milestone ? issue.milestone.title : null,
        created_at: issue.createdAt,
        updated_at: issue.updatedAt,
        projects: issue.projectCards.nodes.map((card) => card.project),
      }));

      console.log(JSON.stringify(extractedIssues, null, 2));
      return extractedIssues
    } catch (error) {
      console.error("Failed to parse response:", error);
    }
  });
});

req.on("error", (error) => {
  console.error(`Got an error: ${error.message}`);
});

req.write(JSON.stringify({ query }));
req.end();