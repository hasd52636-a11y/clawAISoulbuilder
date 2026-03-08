$skills = @(
    'self-imporing-agent',
    'claw-hub', 
    'autoclaw',
    'clawteam',
    'coding-agent',
    'document-skills',
    'frontend-design',
    'code-simplifier',
    'awesome-openclaw-skills',
    'awesome-openclaw-usecases',
    'find-skill',
    'desearch-web-search',
    'ai-web-automation',
    'web-pilot',
    'web-form-automation',
    'web-perf', 
    'web',
    'web-claude',
    'mupeng-web-claude',
    'status-web',
    'Calendar',
    'Email',
    'Notion',
    'Todoist',
    'Quick Note',
    'Weather',
    'News',
    'Recipe',
    'Finance Tracker',
    'GitHub',
    'Jira',
    'Slack',
    'Discord',
    'CRM',
    'Data Analysis',
    'Music',
    'Movie',
    'TV',
    'Book',
    'Creative Writing'
)

$results = @()

foreach ($skill in $skills) {
    try {
        $output = clawdhub search $skill --limit 1 2>&1
        if ($output -match "No results" -or $output -match "error") {
            $results += [PSCustomObject]@{
                Skill = $skill
                Exists = $false
                Description = "未找到"
            }
        } else {
            $results += [PSCustomObject]@{
                Skill = $skill
                Exists = $true
                Description = $output
            }
        }
    } catch {
        $results += [PSCustomObject]@{
            Skill = $skill
            Exists = $false
            Description = "搜索错误"
        }
    }
    Start-Sleep -Milliseconds 200
}

$results | Format-Table -AutoSize